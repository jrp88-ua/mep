use ts_rs::TS;

use super::EntityId;

#[derive(Debug, PartialEq, Eq, Clone, TS)]
#[ts(export, export_to = "../src/types/")]
pub struct AcademicCertre {
    id: EntityId,
    name: String,
}
