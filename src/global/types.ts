import mongoose from 'mongoose'

export interface AuthModel {
  id: string
  username: string
  email: string
  profilePhoto: string
  roles: IFullRole[]
}

export interface IFullEvent {
  id: string
  nameOfEvent: string
  dateOfEvent: string
  maxDateOfConfirmation: string
  typeOfEvent: string
  nameOfCelebrated: string
  userId: string
}

export type IDashboardEvent = Pick<
  IFullEvent,
  'id' | 'nameOfEvent' | 'dateOfEvent'
> & { allowCreateInvites: boolean }

export type IDropdownEvent = Pick<
  IFullEvent,
  'id' | 'nameOfEvent' | 'typeOfEvent'
>

export interface IEventInformation {
  typeOfEvent: string
  settings: string
}

export interface EventModel {
  nameOfEvent: string
  dateOfEvent: string
  maxDateOfConfirmation: string
  typeOfEvent: string
  nameOfCelebrated: string
  userId: string
}

export interface IDropdownEventModel {
  id: string
  nameOfEvent: string
}

export interface IsDeadlineMet {
  isDeadlineMet: number
}
export interface IFullFile {
  id: string
  fileUrl: string
  publicId: string
  image: string
  eventId: string
  imageUsage: string
}

export type IFilesUpload = Pick<IFullFile, 'image' | 'eventId'>

export type IFilesModel = Pick<IFullFile, 'fileUrl' | 'publicId' | 'eventId'>

export type IImageUsageModel = Pick<IFullFile, 'id' | 'imageUsage'>

export type IDownloadImage = Omit<IFullFile, 'image' | 'eventId'>

export type IDownloadAudio = Omit<IFullFile, 'image' | 'eventId' | 'imageUsage'>

export type IFilesId = Pick<IFullFile, 'publicId'>

export interface IFullInviteGroup {
  id: string
  inviteGroup: string
  eventId: string
}

export type IInviteGroup = Omit<IFullInviteGroup, 'id'>

export type IPartialInviteGroup = Omit<IFullInviteGroup, 'eventId'>

export interface IFullInvite {
  id: string
  family: string
  entriesNumber: number
  entriesConfirmed: number | null
  message: string | null
  confirmation: boolean | null
  phoneNumber: string
  kidsAllowed: boolean
  dateOfConfirmation: string | null
  isMessageRead: boolean
  eventId: string
  inviteGroupId: string
  inviteViewed: string
  needsAccomodation: boolean | null
  lastViewedDate: string | null
}

export type IUpsertInvite = Omit<
  IFullInvite,
  | 'entriesConfirmed'
  | 'message'
  | 'confirmation'
  | 'dateOfConfirmation'
  | 'isMessageRead'
  | 'inviteViewed'
  | 'needsAccomodation'
  | 'lastViewedDate'
>

export type IBulkInvite = Pick<
  IFullInvite,
  | 'family'
  | 'entriesNumber'
  | 'phoneNumber'
  | 'kidsAllowed'
  | 'eventId'
  | 'inviteGroupId'
> & { inviteGroupName: string; isNewInviteGroup: boolean }

export type ISaveTheDateConfirmation = Pick<
  IFullInvite,
  'id' | 'needsAccomodation'
>

export type IConfirmation = Pick<
  IFullInvite,
  'confirmation' | 'dateOfConfirmation' | 'entriesConfirmed' | 'id' | 'message'
>

export type IUserInvite = Pick<
  IFullInvite,
  | 'id'
  | 'family'
  | 'entriesNumber'
  | 'confirmation'
  | 'kidsAllowed'
  | 'eventId'
  | 'needsAccomodation'
> & {
  dateOfEvent: string
  maxDateOfConfirmation: string
  nameOfCelebrated: string
  typeOfEvent: string
}

export type IDashboardInvite = Pick<
  IFullInvite,
  | 'entriesConfirmed'
  | 'confirmation'
  | 'dateOfConfirmation'
  | 'entriesNumber'
  | 'eventId'
>

export interface IInviteEventType {
  typeOfEvent: string
}

export interface ILogger {
  dateOfError: string
  customError: string
  exceptionMessage: string
  userId: string
}

export interface MailModel {
  from: string
  to: string
  subject: string
  html: string
}

export interface IFullRole {
  id: string
  name: string
  isActive: boolean
}

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

export interface IWeddingSetting {
  eventId: string
  primaryColor: string
  secondaryColor: string
  groomParents: string
  brideParents: string
  receptionPlace: string
  copyMessage: string
  hotelName: string
  hotelInformation: string
  parents: string
  massUrl: string
  massTime: string
  massPlace: string
  venueUrl: string
  venueTime: string
  venuePlace: string
  civilUrl: string
  civilTime: string
  civilPlace: string
  hotelUrl: string
  hotelAddress: string
  hotelPhone: string
  dressCodeColor: string
}

export interface IFullUser {
  id: string
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  gender: string
  isActive: boolean
  profilePhoto: string
  profilePhotoPublicId: string
  roles: mongoose.Types.ObjectId[]
}

export type IAuthUser = Pick<IFullUser, 'password'> & {
  usernameOrEmail: string
}

export type IUpsertUser = Pick<
  IFullUser,
  'id' | 'username' | 'email' | 'isActive' | 'roles'
>

export type IUserDropdownData = Pick<IFullUser, 'id' | 'username'>

export type IUser = IUserDropdownData &
  Pick<IFullUser, 'email' | 'profilePhoto' | 'roles'>

export type IUserEventsInfo = Omit<IUpsertUser, 'roles'> & {
  numEvents: number
  numEntries: number
}

export type IUserInfo = Pick<IFullUser, 'username' | 'email' | 'isActive'> & {
  _id: mongoose.Types.ObjectId
}

export type IUserProfile = Omit<
  IFullUser,
  'isActive' | 'roles' | 'password' | 'profilePhotoPublicId' | 'profilePhoto'
>

export type IUserProfilePhotoSource = Pick<IFullUser, 'id'> & {
  profilePhotoSource: string
}

export interface IUserAction {
  user: IUpsertUser
  isNew: boolean
}

export type IUserFromInvite = Pick<IFullUser, 'id'>

export type IUserProfilePhoto = Pick<IUserProfilePhotoSource, 'id'> & {
  profilePhoto: string
  profilePhotoPublicId: string
}

export interface IAlbum {
  id: string
  nameOfAlbum: string
  dateOfAlbum: string
  eventId: string
  isActive: boolean
  thumbnail: string
}

export type IUpsertAlbum = Pick<IAlbum, 'nameOfAlbum' | 'eventId'>

export interface IFullAlbumImage {
  id: string
  fileUrl: string
  publicId: string
  image: string
  albumId: string
  isActive: boolean
}

export type IAlbumImage = Omit<IFullAlbumImage, 'image'>

export type IAlbumImageModel = Pick<IFullAlbumImage, 'fileUrl' | 'publicId' | 'albumId'>

export type IImageUpload = Pick<IFullAlbumImage, 'image' | 'albumId'>

export type IOverwriteConfirmation = Pick<IConfirmation, 'entriesConfirmed' | 'confirmation'>