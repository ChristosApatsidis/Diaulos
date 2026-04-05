// types/units.ts

/**
 * These unit types are based on the organizational structure of the Greek military.
 * Note on unit types:
 *  - The "group" unit type is not used in the Greek Air Force.
 *  - The "fleet" unit type is not used in the Greek Navy.
 *  - The "task_force" unit type is not used in the Greek Navy.
 */
export type BranchType = "army" | "air_force" | "navy";

export type ArmyUnitType = 
  | "army" 
  | "corps" 
  | "division" 
  | "brigade" 
  | "regiment";

export type AirForceUnitType =
  | "af_general_staff"       // Αρχηγείο ΓΕΑ — root
  | "af_tactical_command"    // ATA — Larissa
  | "af_support_command"     // DAY — Elefsina
  | "af_training_command"    // DAE — Dekelia
  | "af_combat_wing"         // e.g. 110th, 112th, 120th Combat Wing
  | "af_training_wing"       // e.g. 120th Air Training Wing
  | "af_combat_group"        // e.g. 130th, 133rd Combat Group
  | "af_training_group"      // e.g. 123rd Technical Training Group
  | "af_squadron";           // e.g. 337th "Ghost", 361st Training Sqn

export type NavyUnitType =
  | "navy_general_staff"     // ΓΕΝ — root
  | "fleet_hq"               // Αρχηγείο Στόλου (AS) — Salamis
  | "regional_command"       // NDA (Aegean), NDI (Ionian), NDVE (N. Greece)
  | "functional_command"     // Frigate Cmd, Submarine Cmd, Fast Attack, Amphibious, etc.
  | "navy_aviation_command"  // ΔΑΝ — parallel to fleet
  | "navy_training_command"  // ΔΝΕ
  | "navy_logistics_command" // ΔΔΜΝ
  | "navy_squadron"          // e.g. 1st Navy Helicopter Squadron
  | "ship"                   // individual vessel
  | "submarine";             // individual submarine

export type UnitType = ArmyUnitType | AirForceUnitType | NavyUnitType;

export interface Unit {
  _id?: string;
  _rev?: string;
  type: "unit";
  branch: BranchType;
  unitType: UnitType;
  name: string;
  parentId: string | null;
  location?: string;         // base/city e.g. "Larissa Air Base"
  description?: string;
  createdAt: string;
}

export interface UnitTree extends Unit {
  children: UnitTree[];
}