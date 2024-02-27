use std::sync::Arc;

use super::{
    CreateEntityError, EntityId, Repository, RepositoryEntity,
    RepositoryEntityUpdater, WithAssignedId,
};
use crate::ctx::ApplicationContext;
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
    academic_centre_id: Option<i32>,
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

// region: --- ExamineeService

pub struct ExamineeService {
    repository: Repository<Examinee>,
}

impl ExamineeService {
    pub fn new() -> Self {
        ExamineeService {
            repository: Repository::new(),
        }
    }
}

impl ExamineeService {
    fn create<V: WithAssignedId<Examinee>>(
        &mut self,
        values: V,
    ) -> Result<&Examinee, CreateEntityError> {
        self.repository.create(values)
    }

    fn get(&self, id: EntityId) -> Option<&Examinee> {
        self.repository.get(id)
    }

    fn get_all(&self) -> Vec<&Examinee> {
        self.repository.get_all()
    }

    fn update<V: RepositoryEntityUpdater<Examinee>>(
        &mut self,
        id: EntityId,
        values: V,
    ) -> Option<&Examinee> {
        self.repository.update(id, values)
    }

    fn delete(&mut self, id: EntityId) -> bool {
        self.repository.delete(id)
    }
}

// endregion: --- ExamineeService
