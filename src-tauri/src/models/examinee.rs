use std::collections::HashSet;

use super::{EntityId, RepositoryEntity, RepositoryEntityUpdater, WithAssignedId};
use crate::{ctx::ApplicationState, models::subject::Subject};
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;

// region: --- examinee

#[skip_serializing_none]
#[derive(Serialize, Debug, PartialEq, Eq, Clone)]
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
    pub nif: String,
    pub name: String,
    pub surenames: String,
    pub origin: String,
    pub court: i16,
    pub academic_centre_id: Option<EntityId>,
}

impl WithAssignedId<Examinee> for ExamineeForCreate {
    fn with_assigned_id(self, id: &EntityId) -> Examinee {
        Examinee {
            id: id.clone(),
            nif: self.nif,
            name: self.name,
            surenames: self.surenames,
            origin: self.origin,
            court: self.court,
            academic_centre_id: self.academic_centre_id,
            subjects_ids: HashSet::new(),
        }
    }
}

// endregion: --- ExamineeForCreate

// region: --- ExamineeForUpdate

#[skip_serializing_none]
#[derive(Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ExamineeForUpdate {
    pub nif: Option<String>,
    pub name: Option<String>,
    pub surenames: Option<String>,
    pub origin: Option<String>,
    pub court: Option<i16>,
    pub academic_centre_id: Option<Option<EntityId>>,
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

    pub fn add_subjects_to_examinee(
        &mut self,
        examinee_id: EntityId,
        subjects: Vec<&'_ Subject>,
    ) -> bool {
        type AddSubjects<'a> = Vec<&'a Subject>;
        impl RepositoryEntityUpdater<Examinee> for AddSubjects<'_> {
            fn update_values(self, examine: &mut Examinee) {
                self.into_iter().for_each(|s| {
                    examine.subjects_ids.insert(s.id.clone());
                });
            }
        }

        self.update_examinee(examinee_id, subjects).is_some()
    }

    pub fn bulk_create_examinees(
        &mut self,
        examinees: impl Iterator<Item = ExamineeForCreate>,
    ) -> Box<dyn FnOnce(&ApplicationState) -> ()> {
        let mut created = Vec::new();
        let start_id = self.get_examinees().current_id.clone();

        examinees.for_each(|values| created.push(self.get_examinees().create(values).id.clone()));
        self.modified_state();

        Box::new(move |state: &ApplicationState| {
            state.get_examinees().current_id = start_id;
            created.iter().for_each(|id| {
                state.get_examinees().delete(id.clone());
            });
            state.modified_state();
        })
    }
}

// endregion: --- ExamineeService
