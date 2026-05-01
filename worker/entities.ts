import { IndexedEntity } from "./core-utils";
import type { Member, Ministry } from "@shared/types";
export class MemberEntity extends IndexedEntity<Member> {
  static readonly entityName = "member";
  static readonly indexName = "members";
  static readonly initialState: Member = {
    id: "",
    name: "",
    email: "",
    phone: "",
    avatarUrl: "",
    birthDate: "",
    role: "Membro",
    joinedAt: new Date().toISOString()
  };
  static seedData: Member[] = [
    {
      id: "m1",
      name: "João Silva",
      email: "joao@example.com",
      phone: "11999998888",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
      birthDate: "1985-05-15",
      baptismDate: "2010-10-20",
      role: "Pastor",
      joinedAt: "2010-01-01T10:00:00Z"
    },
    {
      id: "m2",
      name: "Maria Oliveira",
      email: "maria@example.com",
      phone: "11888887777",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
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
    memberIds: []
  };
  static seedData: Ministry[] = [
    {
      id: "min1",
      name: "Louvor & Adoração",
      description: "Equipe responsável pela música e artes nos cultos.",
      leaderId: "m2",
      memberIds: ["m2"]
    },
    {
      id: "min2",
      name: "Kids",
      description: "Ministério voltado para o ensino bíblico infantil.",
      memberIds: ["m1"]
    }
  ];
}