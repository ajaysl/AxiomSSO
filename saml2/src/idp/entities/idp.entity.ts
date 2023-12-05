import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { GenerateId } from 'src/utils';
import { MessageSigningOrderEnum } from '../enums/message-signing-order.enum';
import { NameIDFormatEnum } from '../enums/name-id.enum';

export type IdpDocument = mongoose.Document & Idp;
@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      delete ret.privateKey;
      delete ret.encPrivateKey;
      delete ret._id;
    },
  },
})
export class Idp {
  @Prop({ default: () => GenerateId(), unique: true })
  idpId: string;

  @Prop({ required: true })
  ssoUrl: string;

  @Prop()
  sloUrl: string;

  @Prop({ unique: true })
  entityID: string;

  @Prop({ default: false })
  wantAuthnRequestsSigned: boolean;

  @Prop()
  signingCert: string;

  @Prop()
  privateKey: string;

  @Prop()
  encryptCert: string;

  @Prop()
  encPrivateKey: string;

  @Prop({
    default: false,
  })
  isAssertionEncrypted: boolean;

  @Prop({
    default: MessageSigningOrderEnum.SIGN_THEN_ENCRYPT,
    enum: MessageSigningOrderEnum,
  })
  messageSigningOrder: string;

  @Prop({ default: NameIDFormatEnum.unspecified, enum: NameIDFormatEnum })
  nameIdFormat: NameIDFormatEnum;

  @Prop()
  defaultRelayState: string;
}

export const IdpSchema = SchemaFactory.createForClass(Idp);
