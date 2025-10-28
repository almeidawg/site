import React from 'react';

const PropostaPDF = React.forwardRef(({ proposta, empresa }, ref) => {
  const timbradoUrl = "https://horizons-cdn.hostinger.com/480e77e6-d3aa-4ba8-aa6c-70d9820f550f/timbrado-wg-almeida.png";
  const empresaContratada = empresa || { razao_social: "GRUPO WG ALMEIDA" };

  return (
    <div style={{ width: '210mm', minHeight: '297mm', position: 'relative' }}>
      <div ref={ref} className="bg-white text-black p-12" style={{ width: '100%', minHeight: '297mm', fontFamily: "'Bahnschrift', sans-serif" }}>
        <div 
          className="absolute inset-0 bg-contain bg-no-repeat bg-center opacity-80" 
          style={{ backgroundImage: `url(${timbradoUrl})`, zIndex: 0 }}
        ></div>
        
        <div className="relative z-10 flex flex-col" style={{minHeight: '270mm'}}>
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-center text-wg-orange-base tracking-wider" style={{fontFamily: "'Oswald', sans-serif"}}>
                    PROPOSTA COMERCIAL
                </h1>
                <p className="text-center font-semibold text-gray-600 mb-8">
                    #{proposta.numero}
                </p>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm border-t border-b py-4">
                    <div>
                        <p className="font-bold text-gray-500">CLIENTE:</p>
                        <p className="font-semibold">{proposta.cliente_nome}</p>
                    </div>
                    <div>
                        <p className="font-bold text-gray-500">DATA:</p>
                        <p className="font-semibold">{new Date(proposta.data_criacao).toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                <section className="mb-6">
                    <h2 className="text-lg font-bold mb-3 border-b-2 border-wg-orange-base pb-1" style={{fontFamily: "'Oswald', sans-serif"}}>ESCOPO DOS SERVIÇOS</h2>
                    <div className="text-sm text-justify leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: proposta.descricao?.replace(/\n/g, '<br />') || 'Descrição não informada.' }} />
                </section>

                {proposta.itens && proposta.itens.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-lg font-bold mb-3 border-b-2 border-wg-orange-base pb-1" style={{fontFamily: "'Oswald', sans-serif"}}>DETALHAMENTO DO ORÇAMENTO</h2>
                        <table className="w-full text-left text-sm">
                            <thead className="border-b">
                                <tr>
                                    <th className="py-2 pr-2">Item</th>
                                    <th className="py-2 text-center">Un.</th>
                                    <th className="py-2 text-center">Qtd.</th>
                                    <th className="py-2 text-right">Vl. Unit.</th>
                                    <th className="py-2 text-right">Vl. Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proposta.itens.map((item, idx) => (
                                    <tr key={idx} className="border-b">
                                        <td className="py-2 pr-2">{item.nome}</td>
                                        <td className="py-2 text-center">{item.unidade}</td>
                                        <td className="py-2 text-center">{item.quantidade}</td>
                                        <td className="py-2 text-right">{parseFloat(item.valor_unitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td className="py-2 text-right">{parseFloat(item.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}
                
                <section className="mt-10">
                    <h2 className="text-lg font-bold mb-3 border-b-2 border-wg-orange-base pb-1" style={{fontFamily: "'Oswald', sans-serif"}}>VALOR DO INVESTIMENTO</h2>
                    <div className="flex justify-end items-center">
                        <div className="bg-gray-100 p-4 rounded-lg w-1/2">
                            <div className="flex justify-between items-center">
                                <p className="text-lg font-bold">VALOR TOTAL:</p>
                                <p className="text-2xl font-bold text-wg-orange-base">
                                    {proposta.valor_total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            
            <footer className="mt-auto pt-12 text-xs text-gray-500">
                <div className="border-t pt-4">
                    <p className="font-bold">Termos e Condições:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Esta proposta é válida por 15 dias a contar da data de emissão.</li>
                        <li>O prazo de execução será definido em contrato após a aprovação desta proposta.</li>
                        <li>Condições de pagamento a serem definidas em contrato.</li>
                    </ul>
                </div>
                 <div className="mt-16 text-center">
                    <p>Atenciosamente,</p>
                    <p className="font-bold mt-4">{empresaContratada.razao_social}</p>
                </div>
            </footer>
        </div>
      </div>
    </div>
  );
});

export default PropostaPDF;