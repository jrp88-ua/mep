use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;

use super::EntityId;

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AcademicCentre {
    pub id: EntityId,
    pub name: String,
}
