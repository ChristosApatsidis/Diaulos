// lib/units/hierarchy.ts
import type { BranchType, UnitType } from "@/types/units";

// Maps each unitType to its required parent unitType (null = root)
export const HIERARCHY: Record<UnitType, UnitType | null> = {
  // Army
  army:                    null,
  corps:                   "army",
  division:                "corps",
  brigade:                 "division",
  regiment:                "brigade",

  // Hellenic Air Force
  af_general_staff:        null,
  af_tactical_command:     "af_general_staff",
  af_support_command:      "af_general_staff",
  af_training_command:     "af_general_staff",
  af_combat_wing:          "af_tactical_command",   // or af_support_command
  af_training_wing:        "af_training_command",
  af_combat_group:         "af_tactical_command",
  af_training_group:       "af_training_command",
  af_squadron:             "af_combat_wing",        // or af_training_wing / af_combat_group

  // Hellenic Navy
  navy_general_staff:      null,
  fleet_hq:                "navy_general_staff",
  regional_command:        "navy_general_staff",    // parallel — Aegean, Ionian, North
  functional_command:      "fleet_hq",              // Frigate, Submarine, Fast Attack, Amphibious
  navy_aviation_command:   "navy_general_staff",
  navy_training_command:   "navy_general_staff",
  navy_logistics_command:  "navy_general_staff",
  navy_squadron:           "navy_aviation_command",
  ship:                    "functional_command",
  submarine:               "functional_command",
};

// The valid parent types per unitType
// (some units can have multiple valid parents — checked in the API)
export const VALID_PARENTS: Partial<Record<UnitType, UnitType[]>> = {
  af_combat_wing: ["af_tactical_command", "af_support_command"],
  af_squadron:    ["af_combat_wing", "af_training_wing", "af_combat_group"],
  ship:           ["functional_command", "regional_command"],
  submarine:      ["functional_command"],
};

export const BRANCH_ROOTS: Record<BranchType, UnitType> = {
  army:      "army",
  air_force: "af_general_staff",
  navy:      "navy_general_staff",
};