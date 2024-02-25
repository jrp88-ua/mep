use super::ModelId;
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use ts_rs::TS;

// region: --- Examinee enums

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone, TS)]
#[ts(export, export_to = "../src/types/")]
pub enum ExamineeOrigin {
    Baccalaureate,
    VocationalTraining,
    Other(String),
}

#[skip_serializing_none]
#[derive(Deserialize, Debug, PartialEq, Eq, Clone, TS)]
#[ts(export, export_to = "../src/types/")]
pub enum AcademicCentreForExaminee {
    Name(String),
    Id(ModelId),
}

// endregion: --- Examinee enums

// region: --- Examinee

#[skip_serializing_none]
#[derive(Serialize, Debug, PartialEq, Eq, Clone, TS)]
#[ts(export, export_to = "../src/types/")]
pub struct Examinee {
    id: ModelId,
    name: String,
    surenames: String,
    origin: ExamineeOrigin,
    court: i16,
    academic_centre_id: Option<i32>,
}

// endregion: --- Examinee

// region: --- ExamineeForCreate

#[skip_serializing_none]
#[derive(Deserialize, Debug, PartialEq, Eq, Clone, TS)]
#[ts(export, export_to = "../src/types/")]
pub struct ExamineeForCreate {
    name: String,
    surenames: String,
    origin: ExamineeOrigin,
    court: i16,
    academic_centre: AcademicCentreForExaminee,
}

// endregion: --- ExamineeForCreate

// region: --- ExamineeForUpdate

#[skip_serializing_none]
#[derive(Deserialize, Debug, PartialEq, Eq, Clone, TS)]
#[ts(export, export_to = "../src/types/")]
pub struct ExamineeForUpdate {
    name: Option<String>,
    surenames: Option<String>,
    origin: Option<ExamineeOrigin>,
    court: Option<i16>,
    academic_centre: Option<AcademicCentreForExaminee>,
}

// endregion: --- ExamineeForUpdate
