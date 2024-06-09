use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use ts_rs::TS;

use super::EntityId;

#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Clone, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../../src/lib/types/generated/")]

pub struct Classroom {
    pub id: EntityId,
    pub code: String,
    pub location_code: String,
    pub total_capacity: u32,
    pub exam_capacity: u32,
    pub priority: u32,
    pub court_location: Option<i16>,
    pub kind: String,
    pub notes: Vec<String>,
}
