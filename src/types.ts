export interface IUser{
    UID: string;
    Age?: string;
    FullName?: string;
    Type?: number;
    Sex?: number;
}
export interface IPatient{
    Height: number;
    Weight: number;
    MedicalCondition: string;
    Medications: string;
}
export interface IDoctor{
    Profession: string;
}

export interface IAppointment{
    Description: string;
    Date: number;
    IsDone: boolean;
    IsDeleted: boolean;
}

export interface IChatItem{
    ID: string;
    CreatedAt: number;
    Text: string;
    User: IUser
}

export interface IChat{
    ID?: string;
    LastUpdated: number,
    Users: IUser[],
    Appointment: IAppointment;
    Messages: IChatItem[]
}

export type RootStackParamList = {
    Home: undefined;
    Tabs: undefined;
    Chat: { ID: string };
    Profile: undefined;
    Login: undefined;
    Register: undefined;
  };