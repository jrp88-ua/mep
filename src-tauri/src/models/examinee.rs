use std::collections::HashSet;

use super::EntityId;
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use ts_rs::TS;

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Examinee {
    pub id: EntityId,
    pub nif: String,
    pub name: String,
    pub surenames: String,
    pub origin: String,
    pub court: i16,
    pub academic_centre_id: Option<EntityId>,
    pub subjects_ids: HashSet<EntityId>,
}

#[skip_serializing_none]
#[derive(Deserialize, Serialize, Debug, PartialEq, Eq, Clone, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub struct ExamineeForCreate {
    pub nif: String,
    pub name: String,
    pub surenames: String,
    pub origin: String,
    pub court: i16,
    pub academic_centre: Option<String>,
}
