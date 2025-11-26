import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Mail, MessageCircle, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';

/**
 * Componente reutilizável para ações de exportação e compartilhamento
 * @param {Object} props
 * @param {Object} props.data - Dados do registro (cliente, proposta, compra, etc)
 * @param {string} props.type - Tipo do registro ('pessoa', 'proposta', 'compra', 'assistencia', 'contrato')
 * @param {Function} props.onPDFGenerate - Função customizada para gerar PDF (opcional)
 */
const ActionButtons = ({ data, type, onPDFGenerate }) => {
  const { toast } = useToast();

  const generatePDF = async () => {
    try {
      // Se tiver função customizada, usa ela
      if (onPDFGenerate) {
        await onPDFGenerate(data);
        return;
      }

      // Caso contrário, gera PDF básico
      const pdf = new jsPDF();

      // Header
      pdf.setFontSize(18);
      pdf.text(getTitle(type), 20, 20);

      pdf.setFontSize(12);
      let yPos = 40;

      // Conteúdo baseado no tipo
      const content = getContentForPDF(data, type);
      content.forEach(line => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(line, 20, yPos);
        yPos += 10;
      });

      // Salvar
      const fileName = `${type}_${data.id || 'export'}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);

      toast({ title: 'PDF gerado com sucesso!' });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: 'Erro ao gerar PDF',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const shareWhatsApp = () => {
    try {
      let message = getShareMessage(data, type);
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } catch (error) {
      toast({
        title: 'Erro ao compartilhar',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const shareEmail = () => {
    try {
      const subject = getEmailSubject(type, data);
      const body = getShareMessage(data, type);
      const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = url;
    } catch (error) {
      toast({
        title: 'Erro ao enviar email',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const viewDetails = () => {
    toast({
      title: 'Visualização detalhada',
      description: 'Esta funcionalidade será implementada em breve',
      variant: 'default'
    });
  };

  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={viewDetails}
        title="Visualizar detalhes"
      >
        <FileText className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={generatePDF}
        title="Gerar PDF"
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={shareWhatsApp}
        title="Compartilhar no WhatsApp"
      >
        <MessageCircle className="h-4 w-4 text-green-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={shareEmail}
        title="Enviar por email"
      >
        <Mail className="h-4 w-4 text-blue-600" />
      </Button>
    </div>
  );
};

// Funções auxiliares
const getTitle = (type) => {
  const titles = {
    'pessoa': 'Ficha de Cadastro',
    'proposta': 'Proposta Comercial',
    'compra': 'Pedido de Compra',
    'assistencia': 'Ordem de Serviço',
    'contrato': 'Contrato'
  };
  return titles[type] || 'Documento';
};

const getContentForPDF = (data, type) => {
  const lines = [];

  switch (type) {
    case 'pessoa':
      if (data.nome || data.nome_razao_social) lines.push(`Nome: ${data.nome || data.nome_razao_social}`);
      if (data.cpf_cnpj) lines.push(`CPF/CNPJ: ${data.cpf_cnpj}`);
      if (data.email) lines.push(`Email: ${data.email}`);
      if (data.telefone) lines.push(`Telefone: ${data.telefone}`);
      if (data.endereco) {
        lines.push('');
        lines.push('Endereço:');
        if (data.endereco.logradouro) lines.push(`${data.endereco.logradouro}, ${data.endereco.numero || 'S/N'}`);
        if (data.endereco.bairro) lines.push(`${data.endereco.bairro} - ${data.endereco.cidade || ''}/${data.endereco.uf || ''}`);
        if (data.endereco.cep) lines.push(`CEP: ${data.endereco.cep}`);
      }
      break;

    case 'proposta':
      if (data.numero) lines.push(`Número: ${data.numero}`);
      if (data.cliente_nome) lines.push(`Cliente: ${data.cliente_nome}`);
      if (data.descricao) lines.push(`Descrição: ${data.descricao}`);
      if (data.valor_total) lines.push(`Valor Total: R$ ${data.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      if (data.itens && data.itens.length > 0) {
        lines.push('');
        lines.push('Itens:');
        data.itens.forEach((item, idx) => {
          lines.push(`${idx + 1}. ${item.nome} - Qtd: ${item.quantidade} - R$ ${item.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
        });
      }
      break;

    case 'compra':
      if (data.numero) lines.push(`Pedido: #${data.numero}`);
      if (data.fornecedor) lines.push(`Fornecedor: ${data.fornecedor}`);
      if (data.cliente_nome) lines.push(`Cliente: ${data.cliente_nome}`);
      if (data.itens) lines.push(`Itens: ${data.itens}`);
      if (data.valor_total) lines.push(`Valor: R$ ${data.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      if (data.link) lines.push(`Link: ${data.link}`);
      break;

    case 'assistencia':
      if (data.codigo) lines.push(`Código: ${data.codigo}`);
      if (data.cliente_nome) lines.push(`Cliente: ${data.cliente_nome}`);
      if (data.categoria) lines.push(`Categoria: ${data.categoria}`);
      if (data.descricao) lines.push(`Descrição: ${data.descricao}`);
      if (data.status) lines.push(`Status: ${data.status}`);
      if (data.data_solicitacao) lines.push(`Data: ${new Date(data.data_solicitacao).toLocaleDateString()}`);
      break;

    case 'contrato':
      if (data.numero) lines.push(`Contrato: ${data.numero}`);
      if (data.cliente_nome) lines.push(`Cliente: ${data.cliente_nome}`);
      if (data.proposta_numero) lines.push(`Proposta: ${data.proposta_numero}`);
      if (data.valor_total) lines.push(`Valor: R$ ${data.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      if (data.data_inicio) lines.push(`Início: ${new Date(data.data_inicio).toLocaleDateString()}`);
      if (data.previsao_termino) lines.push(`Término: ${new Date(data.previsao_termino).toLocaleDateString()}`);
      break;
  }

  return lines.length > 0 ? lines : ['Sem dados para exibir'];
};

const getShareMessage = (data, type) => {
  const title = getTitle(type);
  const content = getContentForPDF(data, type);
  return `*${title}*\n\n${content.join('\n')}`;
};

const getEmailSubject = (type, data) => {
  const titles = {
    'pessoa': `Ficha de Cadastro - ${data.nome || data.nome_razao_social || ''}`,
    'proposta': `Proposta ${data.numero || ''} - ${data.cliente_nome || ''}`,
    'compra': `Pedido de Compra #${data.numero || ''}`,
    'assistencia': `Ordem de Serviço ${data.codigo || ''}`,
    'contrato': `Contrato ${data.numero || ''}`
  };
  return titles[type] || 'Documento';
};

export default ActionButtons;
