export interface IInitChat {
  remainingTime: string | number;
  companionId: string;
  userId: string;
}

export interface InitMeeting {
  remainingTime: string | number;
  selfAttendeeId: string;
  companionId: string;
}

export interface ChatMessage {
  pendingId?: string;
  MessageId: string;
  Content: string;
  Metadata: string;
  Type: string;
  CreatedTimestamp: Date;
  LastUpdatedTimestamp: Date;
  LastEditedTimestamp: Date;
  Sender: {
    Arn: string;
    Name: string;
  };
  Redacted: true;
  Status: {
    Value: string;
    Detail: any;
  };
}
