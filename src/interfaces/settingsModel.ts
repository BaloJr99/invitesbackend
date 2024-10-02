export interface IBaseSettings {
  eventId: string
  settings: string
}

export interface ISweetXvSettings {
  eventId: string
  primaryColor: string
  secondaryColor: string
  parents: string
  godParents: string
  firstSectionSentences: string
  secondSectionSentences: string
  massUrl: string
  massTime: string
  massAddress: string
  receptionUrl: string
  receptionTime: string
  receptionPlace: string
  receptionAddress: string
  dressCodeColor: string
}

export interface ISaveTheDateSettings {
  eventId: string
  primaryColor: string
  secondaryColor: string
  receptionPlace: string
}
