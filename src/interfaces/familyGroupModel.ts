export interface FullFamilyGroupModel extends FamilyGroupModel {
  id: string
}

export interface FamilyGroupModel {
  familyGroup: string
  eventId: string
}

export interface PartialFamilyGroupModel {
  familyGroup: string
}
