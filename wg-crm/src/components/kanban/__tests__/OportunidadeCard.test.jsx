import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OportunidadeCard from '@/components/kanban/OportunidadeCard';
import { supabase } from '@/lib/customSupabaseClient';

const baseCard = {
  id: 'card-1',
  titulo: 'Projeto Alfa',
  cliente_nome: 'William Almeida',
  valor: 10000,
  telefone: '11 99999-9999',
  endereco_obra: 'Rua Teste, 123',
  unidade_cliente: 'Apto 12',
  empreendimento: 'Residencial Horizonte',
  payload: {},
};

const renderCard = (props = {}) => {
  const onCardUpdated = vi.fn();

  render(
    <OportunidadeCard
      card={{ ...baseCard, ...props }}
      onCardUpdated={onCardUpdated}
      onCardDeleted={vi.fn()}
      onEditClient={vi.fn()}
      onCreateClient={vi.fn()}
      onCardClick={vi.fn()}
    />
  );

  return { onCardUpdated };
};

describe('OportunidadeCard', () => {
  it('exibe os dados principais do card', () => {
    renderCard();

    expect(screen.getByText('Projeto Alfa')).toBeInTheDocument();
    expect(screen.getByText('William Almeida')).toBeInTheDocument();
    expect(screen.getByText(/Residencial Horizonte/)).toBeInTheDocument();
    expect(screen.getByText(/R\$/)).toHaveTextContent(/R\$\s?10\.000,00/);
  });

  it('permite editar o título e sincroniza com o Supabase', async () => {
    const { onCardUpdated } = renderCard();
    const user = userEvent.setup();

    await user.dblClick(screen.getByText('Projeto Alfa'));

    const input = screen.getByDisplayValue('Projeto Alfa');
    await user.clear(input);
    await user.type(input, 'Projeto Atualizado');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('api_atualizar_card_kanban', {
        p_card_id: baseCard.id,
        p_dados: { titulo: 'Projeto Atualizado' },
      });
    });

    expect(onCardUpdated).toHaveBeenCalled();
  });
});
