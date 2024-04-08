use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use ts_rs::TS;

use super::EntityId;

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone, TS)]
#[ts(export, export_to = "../../src/lib/types/generated/")]
// kind instead of type because type is a reserved keyword
pub enum SubjectKind {
    OBLIGATORY,
    VOLUNTARY,
    UNKNOWN,
}

impl From<&str> for SubjectKind {
    fn from(value: &str) -> Self {
        match value {
            "OBLIGATORY" => Self::OBLIGATORY,
            "VOLUNTARY" => Self::VOLUNTARY,
            _ => Self::UNKNOWN,
        }
    }
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Subject {
    pub id: EntityId,
    pub name: String,
    pub kind: SubjectKind,
}

#[skip_serializing_none]
#[derive(Serialize, Debug, PartialEq, Eq, Clone, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub struct SubjectForCreate {
    pub name: String,
    pub kind: SubjectKind,
}
