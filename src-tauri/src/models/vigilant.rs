use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use ts_rs::TS;

use super::EntityId;

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone, TS)]
#[ts(export, export_to = "../../src/lib/types/generated/")]

pub enum VigilantRole {
    PRESIDENT,
    SECRETARY,
    MEMBER,
}

#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Clone, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../../src/lib/types/generated/")]

pub struct Vigilant {
    pub id: EntityId,
    pub name: String,
    pub surenames: String,
    pub role: VigilantRole,
    pub specialties_ids: Vec<EntityId>,
    pub academic_centre_id: Option<EntityId>,
    pub main_court: i16,
}
