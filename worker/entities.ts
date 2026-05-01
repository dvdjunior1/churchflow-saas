import { IndexedEntity } from "./core-utils";
import type { Member, Ministry, MinistryMember, FinancialRecord, ChurchEvent } from "@shared/types";
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
export class FinancialRecordEntity extends IndexedEntity<FinancialRecord> {
  static readonly entityName = "financial-record";
  static readonly indexName = "financial-records";
  static readonly initialState: FinancialRecord = {
    id: "",
    amount: 0,
    date: new Date().toISOString(),
    type: "offering",
    category: "Geral",
    description: ""
  };
  static seedData: FinancialRecord[] = [
    { id: "f1", memberId: "m1", amount: 500, date: new Date().toISOString(), type: "tithe", category: "Dízimo", description: "Dízimo fiel" },
    { id: "f2", amount: 1200, date: new Date().toISOString(), type: "offering", category: "Oferta", description: "Oferta de culto" }
  ];
}
export class EventEntity extends IndexedEntity<ChurchEvent> {
  static readonly entityName = "church-event";
  static readonly indexName = "church-events";
  static readonly initialState: ChurchEvent = {
    id: "",
    title: "",
    description: "",
    date: new Date().toISOString(),
    time: "19:00",
    location: "Santuário",
    category: "culto"
  };
  static seedData: ChurchEvent[] = [
    {
      id: "ev1",
      title: "Culto de Celebração",
      description: "Culto principal com toda a família.",
      date: new Date(Date.now() + 86400000 * 2).toISOString(),
      time: "18:00",
      location: "Templo Principal",
      category: "culto"
    },
    {
      id: "ev2",
      title: "Ensaio do Louvor",
      description: "Preparação para o domingo.",
      date: new Date(Date.now() + 86400000).toISOString(),
      time: "20:00",
      location: "Auditório",
      category: "ensaio"
    },
    {
      id: "ev3",
      title: "Reunião de Liderança",
      description: "Planejamento estratégico mensal.",
      date: new Date(Date.now() + 86400000 * 5).toISOString(),
      time: "19:30",
      location: "Sala de Reuniões",
      category: "reuniao"
    }
  ];
}