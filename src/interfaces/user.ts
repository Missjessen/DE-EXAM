import { IUser } from './iUser';
export interface User  extends Document {
    tenantId:  string;
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
  
     googleAccounts?: IUser[];

}