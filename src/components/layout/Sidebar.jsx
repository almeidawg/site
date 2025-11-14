import React from 'react';
import {
  KanbanSquare, LayoutDashboard, FileText, FileSignature, Users,
  Folder, DraftingCompass, HardHat, Lamp, Wrench, Settings, Users2,
  ShoppingCart, Briefcase, Store, DollarSign, GanttChart, Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTabs } from '@/contexts/TabContext';

const iconMap = {
  LayoutDashboard,
  KanbanSquare,
  FileText,
  FileSignature,
  Users,
  Folder,
  DraftingCompass,
  HardHat,
  Lamp,
  Wrench,
  Settings,
  Users2,
  ShoppingCart,
  Briefcase,
  Store,
  DollarSign,
  GanttChart,
  Package, // usado para Depósito
};
const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },

  // CRM
  {
    section: 'CRM',
    items: [
      { path: '/oportunidades', label: 'Leads & Oportunidades', icon: 'KanbanSquare' },
      { path: '/pessoas', label: 'Clientes', icon: 'Users' },
      { path: '/propostas', label: 'Propostas', icon: 'FileText' },
      { path: '/contratos', label: 'Contratos', icon: 'FileSignature' },
      { path: '/financeiro-ext', label: 'Financeiro (CRM)', icon: 'DollarSign' },
      { path: '/documentos', label: 'Documentos', icon: 'Folder' },
    ],
  },

  // Núcleos técnicos
  {
    section: 'Arquitetura',
    items: [
      { path: '/arquitetura', label: 'Arquitetura', icon: 'DraftingCompass' },
    ],
  },
  {
    section: 'Engenharia',
    items: [
      { path: '/engenharia', label: 'Engenharia', icon: 'HardHat' },
    ],
  },
  {
    section: 'Marcenaria',
    items: [
      { path: '/marcenaria', label: 'Marcenaria', icon: 'Lamp' },
    ],
  },

  // Operacional
  {
    section: 'Operacional',
    items: [
      { path: '/cronogramas', label: 'Projects (Cronograma)', icon: 'GanttChart' },
      { path: '/compras', label: 'Compras', icon: 'ShoppingCart' },
      { path: '/assistencia', label: 'Assistência', icon: 'Wrench' },
      // futuro: Equipes
      // { path: '/equipes', label: 'Equipes', icon: 'Users2' },
      { path: '/deposito', label: 'Depósito', icon: 'Package' },
    ],
  },

  // Financeiro
  {
    section: 'Financeiro',
    items: [
      { path: '/financeiro-ext', label: 'Financeiro Geral', icon: 'DollarSign' },
      // futuro: calculadora de comissão própria
      // { path: '/financeiro-comissao', label: 'Calculadora de Comissão', icon: 'DollarSign' },
    ],
  },

  // Links / Stores / Institucional
  {
    section: 'WG Store',
    items: [
      { path: '#store-modal', label: 'WG Store', icon: 'Store' },
    ],
  },

  // Administrativo
  {
    section: 'Administrativo',
    items: [
      { path: '/usuarios', label: 'Usuários', icon: 'Users2' },
      { path: '/configuracoes', label: 'Configurações', icon: 'Settings' },
    ],
  },
];
