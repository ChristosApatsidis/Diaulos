# Distributed Application Architecture with Couch db

Building three identical Node.js applications, each with its own independent Couch database cluster, synchronized in real-time using Cross Data Center Replication (XDCR) in a full mesh topology. This architecture ensures that data written to any application is automatically replicated to all other instances, providing high availability, geographic redundancy, and low-latency local reads across all deployments. 

Each application operates independently with full read/write capabilities to its local database, eliminating cross-region latency for end users. When any application modifies data, Couch XDCR automatically propagates those changes to the other two databases within seconds, creating a eventually-consistent distributed system. This full mesh topology means every cluster replicates to every other cluster (6 total replication streams), providing maximum fault tolerance—the system continues operating even if two out of three instances fail. Conflict resolution is handled automatically using Last Write Wins (LWW) strategy based on timestamps, ensuring data integrity across all nodes without manual intervention.

## Architecture Overview - All-to-All Replication

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Full Mesh XDRC Topology (All-to-All)                    │
│                    Every Cluster Replicates to Every Other                  │
└─────────────────────────────────────────────────────────────────────────────┘

                           ┌──────────────────────┐
                           │    Data Center 2     │
                           │                      │
                           │  ┌────────────────┐  │
                           │  │   Node.js      │  │
                           │  │  Application   │  │
                           │  │   (App 2)      │  │
                           │  └────────┬───────┘  │
                           │           │ SDK      │
                           │           ▼          │
                           │  ┌────────────────┐  │
         ┌─────────────────┼──│   Couch db     │──┼────────────────┐
         │                 │  │   Cluster 2    │  │                │
         │      ┌──────────┼─►│                │──┼──────────┐     │
         │      │   XDRC   │  │  [Bucket: DB2] │  │ XDRC     │     │
         │      │          │  └────────────────┘  │          │     │
         │      │          │                      │          │     │
         │      │          └──────────────────────┘          │     │
         │      │                                            │     │
         │      │                                            │     │
         │      │                                            │     │
         │      │                                            │     │
         ▼      │                                            │     ▼ 
┌──────────────────────┐                               ┌──────────────────────┐
│    Data Center 1     │                               │    Data Center 3     │
│                      │                               │                      │
│  ┌────────────────┐  │                               │  ┌────────────────┐  │
│  │   Node.js      │  │                               │  │   Node.js      │  │
│  │  Application   │  │                               │  │  Application   │  │
│  │   (App 1)      │  │                               │  │   (App 3)      │  │
│  └────────┬───────┘  │                               │  └────────┬───────┘  │
│           │ SDK      │                               │           │ SDK      │
│           ▼          │                               │           ▼          │
│  ┌────────────────┐  │                               │  ┌────────────────┐  │
│  │  Couch db      │◄─├───────────────────────────────┼──┤  Couch db      │  │
│  │   Cluster 1    │  │      XDRC (Bidirectional)     │  │   Cluster 3    │  │
│  │                │──├──────────────────────────────►│  │                │  │
│  │  [Bucket: DB1] │  │                               │  │  [Bucket: DB3] │  │
│  └────────────────┘  │                               │  └────────────────┘  │
│                      │                               │                      │
└──────────────────────┘                               └──────────────────────┘
```

## Complete XDRC Replication Matrix

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   Source    │  Cluster 1  │  Cluster 2  │  Cluster 3  │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ Cluster 1   │      -      │      ✓      │      ✓      │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ Cluster 2   │      ✓      │      -      │      ✓      │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ Cluster 3   │      ✓      │      ✓      │      -      │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

✓ = Active XDRC Replication Stream  
\- = No replication (same cluster)

## Bidirectional Replication Streams

### Total Replication Streams: 6

**From Cluster 1:**
1. Cluster 1 → Cluster 2  (Stream 1)
2. Cluster 1 → Cluster 3  (Stream 2)

**From Cluster 2:**
3. Cluster 2 → Cluster 1  (Stream 3)
4. Cluster 2 → Cluster 3  (Stream 4)

**From Cluster 3:**
5. Cluster 3 → Cluster 1  (Stream 5)
6. Cluster 3 → Cluster 2  (Stream 6)

## Detailed Component Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                            DATA CENTER 1                              │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Node.js Application 1 (Port: 3001)                             │  │
│  │  - Next.js                                                      │  │
│  │  - Couch db                                                     │  │
│  └─────────────────────────────┬───────────────────────────────────┘  │
│                                │                                      │
│                                │ Couch db Connection                  │
│                                ▼                                      │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  Couch db Cluster 1                                            │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  Bucket: app1_bucket                                     │  │   │
│  │  │  - Documents                                             │  │   │
│  │  │  - Indexes                                               │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  │                                                                │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  XDRC Remote References                                  │  │   │
│  │  │  ├─► Remote Cluster 2 (IP: 192.168.1.2)                  │  │   │
│  │  │  └─► Remote Cluster 3 (IP: 192.168.1.3)                  │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  │                                                                │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  XDRC Replications (Outbound)                            │  │   │
│  │  │  ├─► To Cluster 2: app1_bucket → app2_bucket             │  │   │
│  │  │  └─► To Cluster 3: app1_bucket → app3_bucket             │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  │                                                                │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  XDRC Replications (Inbound)                             │  │   │
│  │  │  ├─► From Cluster 2: app2_bucket → app1_bucket           │  │   │
│  │  │  └─► From Cluster 3: app3_bucket → app1_bucket           │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────────────┐
│                            DATA CENTER 2                              │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Node.js Application 2 (Port: 3002)                             │  │
│  │  - Next.js                                                      │  │ 
│  │  - Couch db                                                     │  │
│  └─────────────────────────────┬───────────────────────────────────┘  │
│                                │                                      │
│                                │ Couch db Connection                  │
│                                ▼                                      │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  Couch db Cluster 2                                            │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  Bucket: app2_bucket                                     │  │   │
│  │  │  - Documents                                             │  │   │
│  │  │  - Indexes                                               │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  │                                                                │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  XDRC Remote References                                  │  │   │
│  │  │  ├─► Remote Cluster 1 (IP: 192.168.1.100)                │  │   │
│  │  │  └─► Remote Cluster 3 (IP: 192.168.3.100)                │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  │                                                                │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  XDRC Replications (Outbound)                            │  │   │
│  │  │  ├─► To Cluster 1: app2_bucket → app1_bucket             │  │   │
│  │  │  └─► To Cluster 3: app2_bucket → app3_bucket             │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  │                                                                │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  XDRC Replications (Inbound)                             │  │   │
│  │  │  ├─► From Cluster 1: app1_bucket → app2_bucket           │  │   │
│  │  │  └─► From Cluster 3: app3_bucket → app2_bucket           │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────────────┐
│                            DATA CENTER 3                              │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  Node.js Application 3 (Port: 3003)                            │   │
│  │  - Node.js                                                     │   │
│  │  - Couch db                                                    │   │
│  └─────────────────────────────┬──────────────────────────────────┘   │
│                                │                                      │
│                                │ Couch db Connection                  │
│                                ▼                                      │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  Couch db Cluster 3                                            │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  Bucket: app3_bucket                                     │  │   │
│  │  │  - Documents                                             │  │   │
│  │  │  - Indexes                                               │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  │                                                                │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  XDRC Remote References                                  │  │   │
│  │  │  ├─► Remote Cluster 1 (IP: 192.168.1.100)                │  │   │
│  │  │  └─► Remote Cluster 2 (IP: 192.168.2.100)                │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  │                                                                │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  XDRC Replications (Outbound)                            │  │   │
│  │  │  ├─► To Cluster 1: app3_bucket → app1_bucket             │  │   │
│  │  │  └─► To Cluster 2: app3_bucket → app2_bucket             │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  │                                                                │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  XDRC Replications (Inbound)                             │  │   │
│  │  │  ├─► From Cluster 1: app1_bucket → app3_bucket           │  │   │
│  │  │  └─► From Cluster 2: app2_bucket → app3_bucket           │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## Data Flow Example

**Scenario: User creates a document in Cluster 1**

1. App 1 writes document to Cluster 1 → Success
2. Cluster 1 XDRC replicates to Cluster 2 → Document appears in Cluster 2
3. Cluster 1 XDRC replicates to Cluster 3 → Document appears in Cluster 3
4. All clusters now have the same document
5. Conflict resolution: Last Write Wins (LWW) based on timestamp

## Network Configuration

| Cluster | IP Address    | Ports       | Node.js Port | Remote Clusters Connected |
|---------|---------------|-------------|--------------|---------------------------|
| 1       | 192.168.1.1   | 8091-8096   | 3001         | Cluster 2, Cluster 3      |
| 2       | 192.168.1.2   | 8091-8096   | 3002         | Cluster 1, Cluster 3      |
| 3       | 192.168.1.3   | 8091-8096   | 3003         | Cluster 1, Cluster 2      |


## Two-Battalion Bidirectional Database Synchronization with XDCR

A multiple battalion architecture where each battalion operates its own "primary" Couch database instance. The two primary databases maintain bidirectional XDCR synchronization, ensuring that any data created or modified in Battalion 1's database is automatically replicated to Battalion 2's database, and vice versa, providing real-time data consistency across both battalions.

```
┌─────────────────────────────────────┐        ┌─────────────────────────────────────┐
│ BATTALION 1                         │        │ BATTALION 2                         │
│                                     │        │                                     │
│ ┌───────────────────────────────┐   │        │ ┌───────────────────────────────┐   │
│ │ Company A                     │   │        │ │ Company A                     │   │
│ └───────────┬───────────────────┘   │        │ └───────────┬───────────────────┘   │
│             │                       │        │             │                       │
│             │ Read/Write            │        │             │ Read/Write            │
│             ▼                       │        │             ▼                       │
│ ┌───────────────────────────────┐   │        │ ┌───────────────────────────────┐   │
│ │ Company B                     │   │        │ │ Company B                     │   │
│ └───────────┬───────────────────┘   │        │ └───────────┬───────────────────┘   │
│             │                       │        │             │                       │
│             │ Read/Write            │        │             │ Read/Write            │
│             ▼                       │        │             ▼                       │
│ ┌───────────────────────────────┐   │        │  ┌───────────────────────────────┐  │
│ │ Company C                     │◄──├────────┼──┤ Company C                     │  │
│ │ (Battalion 1)                 │   │        │  │ (Battalion 2)                 │  │
│ │                               │   │        │  │                               │  │
│ │                               │   │ XDCR   │  │                               │  │
│ │                               │ ──┼────────┼─►│                               │  │ 
│ └───────────────────────────────┘   │        │  └───────────────────────────────┘  │
│                                     │        │                                     │
│ Node.js App (Port: 3001)            │        │ Node.js App (Port: 3001)            │
└─────────────────────────────────────┘        └─────────────────────────────────────┘
```

## Key Features of Full Mesh Topology

✅ **High Availability**: Any cluster can fail without data loss  
✅ **Maximum Redundancy**: 3 copies of all data (one per cluster)  
✅ **Low Latency Reads**: Each app reads from local cluster  
✅ **Automatic Failover**: Apps can switch to any available cluster  
✅ **Conflict Resolution**: Built-in CAS and LWW mechanisms  
✅ **Real-time Sync**: Changes propagate within seconds

## Conflict Resolution Strategy

When the same document is modified in multiple clusters simultaneously:

1. **Timestamp Comparison**: Most recent write wins
2. **CAS (Compare And Swap)**: Version vectors track changes
3. **Revision ID**: Highest revision ID wins ties
4. **Custom Resolution**: Can implement application-level conflict handlers

## Benefits & Trade-offs

### Benefits:
- Complete data redundancy across all locations
- Maximum fault tolerance (can lose 2 clusters and still operate)
- Fastest possible reads (always local)
- No single point of failure

### Trade-offs:
- 6 replication streams to manage
- Higher network bandwidth usage
- More complex conflict resolution
- Increased storage requirements (3x total data)

## Monitoring Recommendations

Monitor these metrics for each replication stream:

- Replication lag (should be < 1 second)
- Mutations replicated per second
- Replication queue depth
- Conflict resolution frequency
- Network bandwidth utilization
- Failed replication attempts

## Implementation Notes

### Setting up Replication in Couch db:

1. **Create Remote Cluster References**: In each cluster's admin console, add the other two clusters as remote references
2. **Configure Replications**: Set up bidirectional replication for each bucket pair
3. **Enable Advanced Filtering** (optional): Filter which documents replicate based on criteria
4. **Configure Conflict Resolution**: Choose LWW (default) or custom resolution logic
5. **Monitor Health**: Use Couch db Web Console to monitor replication status

## Security Considerations

- Use TLS/SSL for XDRC connections between clusters
- Implement proper authentication for remote cluster access
- Secure network connections between data centers (VPN/private links)
- Enable audit logging for replication events
- Regularly rotate credentials
- Monitor for unauthorized replication attempts