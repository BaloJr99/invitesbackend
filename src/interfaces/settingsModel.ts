export interface FullSettingsModel  extends SettingsModel {
  userId: string
}

export interface SettingsModel {
  eventId: string,
  primaryColor: string,
  secondaryColor: string,
  parents: string,
  godParents: string,
  firstSectionSentences: string,
  secondSectionSentences: string,
  massUrl: string,
  massTime: string,
  massAddress: string,
  receptionUrl: string,
  receptionTime: string,
  receptionPlace: string,
  receptionAddress: string,
  dressCodeColor: string
}