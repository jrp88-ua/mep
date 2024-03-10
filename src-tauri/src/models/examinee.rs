use super::{EntityId, RepositoryEntity, RepositoryEntityUpdater, WithAssignedId};
use crate::ctx::ApplicationState;
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;

// region: --- examinee

#[skip_serializing_none]
#[derive(Serialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Examinee {
    id: EntityId,
    name: String,
    surenames: String,
    origin: String,
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
#[derive(Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ExamineeForCreate {
    pub name: String,
    pub surenames: String,
    pub origin: String,
    pub court: i16,
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
#[derive(Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ExamineeForUpdate {
    name: Option<String>,
    surenames: Option<String>,
    origin: Option<String>,
    court: Option<i16>,
}

// endregion: --- ExamineeForUpdate

// region: --- ExamineeService

impl ApplicationState {
    pub fn create_examinee<V: WithAssignedId<Examinee>>(&mut self, values: V) -> Examinee {
        let mut examinees = self.get_examinees();
        let result = examinees.create(values);
        self.modified_state();
        result.clone()
    }

    pub fn get_examinee(&self, id: EntityId) -> Option<Examinee> {
        let examinees = self.get_examinees();
        let examinee = examinees.get(id)?;
        Some(examinee.clone())
    }

    pub fn get_all_examinees(&self) -> Vec<Examinee> {
        self.get_examinees()
            .get_all()
            .iter()
            .map(|examinee| Examinee::clone(&examinee))
            .collect()
    }

    pub fn update_examinee<V: RepositoryEntityUpdater<Examinee>>(
        &mut self,
        id: EntityId,
        values: V,
    ) -> Option<Examinee> {
        let mut examinees = self.get_examinees();
        let result = examinees.update(id, values)?;
        self.modified_state();
        Some(result.clone())
    }

    pub fn delete_examinee(&mut self, id: EntityId) -> bool {
        let deleted = self.get_examinees().delete(id);
        if deleted {
            self.modified_state();
        }
        deleted
    }
}

// endregion: --- ExamineeService
