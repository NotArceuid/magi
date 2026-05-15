import { InvokeableEvent } from "$lib/utils/Events";

export interface INotification {
  name: string;
  description: string;
}

export const NotificationPopUp = new InvokeableEvent<INotification>();
