use super::{EntityId, RepositoryEntity, RepositoryEntityUpdater, WithAssignedId};
use crate::ctx::ApplicationState;
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
    Id(EntityId),
}

// endregion: --- Examinee enums

// region: --- examinee

#[skip_serializing_none]
#[derive(Serialize, Debug, PartialEq, Eq, Clone, TS)]
#[ts(export, export_to = "../src/types/")]
pub struct Examinee {
    id: EntityId,
    name: String,
    surenames: String,
    origin: ExamineeOrigin,
    court: i16,
}

impl RepositoryEntity for Examinee {
    fn id(&self) -> EntityId {
        self.id.clone()
    }
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
}

impl WithAssignedId<Examinee> for ExamineeForCreate {
    fn with_assigned_id(&self, id: &EntityId) -> Examinee {
        Examinee {
            id: id.clone(),
            name: self.name.clone(),
            surenames: self.surenames.clone(),
            origin: self.origin.clone(),
            court: self.court,
        }
    }
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

// region: --- ExamineeService

impl ApplicationState {
    pub fn create_examinee<V: WithAssignedId<Examinee>>(&mut self, values: V) -> &Examinee {
        let result = self.get_examinees_mut().create(values);
        self.modified_state();
        result
    }

    pub fn get_examinee(&self, id: EntityId) -> Option<&Examinee> {
        self.get_examinees().get(id)
    }

    pub fn get_all_examinees(&self) -> Vec<&Examinee> {
        self.get_examinees().get_all()
    }

    pub fn update_examinee<V: RepositoryEntityUpdater<Examinee>>(
        &mut self,
        id: EntityId,
        values: V,
    ) -> Option<&Examinee> {
        let examinees = self.get_examinees_mut();
        let result = examinees.update(id, values);
        if result.is_some() {
            self.modified_state();
        }
        result
    }

    pub fn delete_examinee(&mut self, id: EntityId) -> bool {
        let deleted = self.get_examinees_mut().delete(id);
        if deleted {
            self.modified_state();
        }
        deleted
    }
}

// endregion: --- ExamineeService
