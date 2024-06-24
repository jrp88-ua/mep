use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use ts_rs::TS;

use super::EntityId;

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone, TS)]
#[ts(export, export_to = "../../src/lib/types/generated/")]

pub struct AllExamConfiguration(Vec<ExamConfiguration>);

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone, TS)]
#[serde(rename_all = "camelCase", tag = "type")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub enum ExamConfiguration {
    IndividualExam {
        subject: EntityId,
        examinees: Vec<EntityId>,
        classrooms: Vec<EntityId>,
        vigilants: Vec<EntityId>,
        specialists: Vec<EntityId>,
        distribution: Option<ExamDistribution>,
    },
    CollidingExams,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub struct ExamDistribution {
    subject: EntityId,
    specialists: Vec<EntityId>,
    distribution: Vec<ExamClassroomDistribution>,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../../src/lib/types/generated/")]
pub struct ExamClassroomDistribution {
    classroom: EntityId,
    examinees: Vec<EntityId>,
    vigilants: Vec<EntityId>,
}
