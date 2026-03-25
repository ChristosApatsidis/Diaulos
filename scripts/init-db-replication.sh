#!/bin/bash

echo "⏳ Waiting for CouchDB nodes to start..."
sleep 2

COUCH1="http://admin:secret123456789@localhost:5984"
COUCH2="http://admin:secret123456789@localhost:5985"
COUCH3="http://admin:secret123456789@localhost:5986"

# Internal container names used inside Docker network for replication URLs
C1="http://admin:secret123456789@couchdb1:5984"
C2="http://admin:secret123456789@couchdb2:5984"
C3="http://admin:secret123456789@couchdb3:5984"

# ── System databases ────────────────────────────────────────────────────────
echo "✅ Creating system databases on all nodes..."
for NODE in $COUCH1 $COUCH2 $COUCH3; do
  curl -s -X PUT $NODE/_users > /dev/null
  curl -s -X PUT $NODE/_replicator > /dev/null
  curl -s -X PUT $NODE/_global_changes > /dev/null
done

# ── App databases ───────────────────────────────────────────────────────────
echo "✅ Creating app databases on all nodes..."
for NODE in $COUCH1 $COUCH2 $COUCH3; do
  curl -s -X PUT $NODE/users > /dev/null
  curl -s -X PUT $NODE/accounts > /dev/null
  curl -s -X PUT $NODE/sessions > /dev/null
done

# ── Helper: create a continuous replication entry ───────────────────────────
replicate() {
  local REPLICATOR_HOST=$1   # host where the _replicator doc lives
  local ID=$2
  local SOURCE=$3
  local TARGET=$4
  local DATABASE=$5
  local target_name=$6

  echo "🔄  $ID"
  curl -s -X POST "$REPLICATOR_HOST/_replicator" \
    -H "Content-Type: application/json" \
    -d "{
      \"_id\": \"$ID\",
      \"source\": \"$SOURCE/$DATABASE\",
      \"target\": \"$TARGET/$DATABASE\",
      \"continuous\": true,
      \"create_target\": true,
      \"target_name\": \"${target_name}\" 
    }" > /dev/null
}

# ── 2-way replication (all pairs, both directions) ──────────────────────────
echo ""
echo "🔄 Configuring 2-way active-active replication..."

# Node 1 as replication coordinator for outgoing 1→2 1→3
replicate $COUCH1 "node1-to-node2-users" $C1 $C2 "users" "Node 2"
sleep 0.5
replicate $COUCH1 "node1-to-node2-accounts" $C1 $C2 "accounts" "Node 2"
sleep 0.5
replicate $COUCH1 "node1-to-node2-sessions" $C1 $C2 "sessions" "Node 2"
sleep 0.5
replicate $COUCH1 "node1-to-node3-users" $C1 $C3 "users" "Node 3"
sleep 0.5
replicate $COUCH1 "node1-to-node3-accounts" $C1 $C3 "accounts" "Node 3"
sleep 0.5
replicate $COUCH1 "node1-to-node3-sessions" $C1 $C3 "sessions" "Node 3"
sleep 0.5

# Node 2 as replication coordinator for outgoing 2→1 and 2→3
replicate $COUCH2 "node2-to-node1-users" $C2 $C1 "users" "Node 1"
sleep 0.5
replicate $COUCH2 "node2-to-node1-accounts" $C2 $C1 "accounts" "Node 1"
sleep 0.5
replicate $COUCH2 "node2-to-node1-sessions" $C2 $C1 "sessions" "Node 1"
sleep 0.5
replicate $COUCH2 "node2-to-node3-users" $C2 $C3 "users" "Node 3"
sleep 0.5
replicate $COUCH2 "node2-to-node3-accounts" $C2 $C3 "accounts" "Node 3"
sleep 0.5
replicate $COUCH2 "node2-to-node3-sessions" $C2 $C3 "sessions" "Node 3"
sleep 0.5

# Node 3 as replication coordinator for outgoing 3→1 and 3→2
replicate $COUCH3 "node3-to-node1-users" $C3 $C1 "users" "Node 1"
sleep 0.5
replicate $COUCH3 "node3-to-node1-accounts" $C3 $C1 "accounts" "Node 1"
sleep 0.5
replicate $COUCH3 "node3-to-node1-sessions" $C3 $C1 "sessions" "Node 1"
sleep 0.5
replicate $COUCH3 "node3-to-node2-users" $C3 $C2 "users" "Node 2"
sleep 0.5
replicate $COUCH3 "node3-to-node2-accounts" $C3 $C2 "accounts" "Node 2"
sleep 0.5
replicate $COUCH3 "node3-to-node2-sessions" $C3 $C2 "sessions" "Node 2"
sleep 0.5

# ── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo "✅ Active-Active replication configured across all 3 nodes!"
echo ""
echo "📊 Node 1 Dashboard: http://localhost:5984/_utils"
echo "📊 Node 2 Dashboard: http://localhost:5985/_utils"
echo "📊 Node 3 Dashboard: http://localhost:5986/_utils"
echo ""
echo "🔍 Check replication status on any node, e.g.:"
echo "   curl -s http://admin:secret@localhost:5984/_scheduler/jobs | jq"