import { IndexedEntity } from "./core-utils";
import type { Member, Ministry, MinistryMember } from "@shared/types";
export class MemberEntity extends IndexedEntity<Member> {
  static readonly entityName = "member";
  static readonly indexName = "members";
  static readonly initialState: Member = {
    id: "",
    fullName: "",
    email: "",
    phone: "",
    photoUrl: "",
    birthDate: "",
    role: "Membro",
    joinedAt: new Date().toISOString()
  };
  static seedData: Member[] = [
    {
      id: "m1",
      fullName: "João Silva",
      email: "joao@example.com",
      phone: "11999998888",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
      birthDate: "1985-05-15",
      baptismDate: "2010-10-20",
      role: "Pastor",
      joinedAt: "2010-01-01T10:00:00Z"
    },
    {
      id: "m2",
      fullName: "Maria Oliveira",
      email: "maria@example.com",
      phone: "11888887777",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      birthDate: "1992-08-22",
      role: "Líder de Louvor",
      joinedAt: "2015-06-12T10:00:00Z"
    }
  ];
}
export class MinistryEntity extends IndexedEntity<Ministry> {
  static readonly entityName = "ministry";
  static readonly indexName = "ministries";
  static readonly initialState: Ministry = {
    id: "",
    name: "",
    description: "",
  };
  static seedData: Ministry[] = [
    {
      id: "min1",
      name: "Louvor & Adoração",
      description: "Equipe responsável pela música e artes nos cultos.",
      leaderId: "m2",
    },
    {
      id: "min2",
      name: "Kids",
      description: "Ministério voltado para o ensino bíblico infantil.",
    }
  ];
}
export class MinistryMemberEntity extends IndexedEntity<MinistryMember> {
  static readonly entityName = "ministry-member";
  static readonly indexName = "ministry-members";
  static readonly initialState: MinistryMember = {
    id: "",
    memberId: "",
    ministryId: "",
    role: "member"
  };
  static seedData: MinistryMember[] = [
    { id: "mm1", memberId: "m2", ministryId: "min1", role: "leader" },
    { id: "mm2", memberId: "m1", ministryId: "min2", role: "member" }
  ];
}