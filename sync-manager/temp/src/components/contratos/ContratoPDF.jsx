import React from 'react';

const ContratoPDF = React.forwardRef(({ contrato }, ref) => {
  const timbradoUrl = "https://horizons-cdn.hostinger.com/480e77e6-d3aa-4ba8-aa6c-70d9820f550f/timbrado-wg-almeida.png";

  return (
    <div style={{ width: '210mm', minHeight: '297mm', position: 'relative' }}>
      <div ref={ref} className="bg-white text-black" style={{ width: '100%', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}>
        <div 
          className="absolute inset-0 bg-contain bg-no-repeat bg-center" 
          style={{ backgroundImage: `url(${timbradoUrl})`, zIndex: 0 }}
        ></div>
        <div className="relative pt-[150px] px-16 pb-16 z-10 h-full flex flex-col" style={{ minHeight: '297mm' }}>
          <div className="flex-grow">
            <h1 className="text-2xl font-bold text-center mb-8">
              CONTRATO DE PRESTAÇÃO DE SERVIÇOS
            </h1>
            <div 
              className="text-sm text-justify leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: contrato.conteudo.replace(/\n/g, '<br />') }}
            />
          </div>
          <div className="flex-shrink-0 mt-auto pt-8">
            <div className="mt-16">
              <p className="text-center">_________________________________________</p>
              <p className="text-center font-semibold">{contrato.targetName}</p>
              <p className="text-center text-xs">(Contratante)</p>
            </div>
            <div className="mt-8">
              <p className="text-center">_________________________________________</p>
              <p className="text-center font-semibold">WG ALMEIDA ENGENHARIA</p>
              <p className="text-center text-xs">(Contratada)</p>
            </div>
            <div className="mt-16 text-center text-xs">
              <p>Gerado em: {new Date(contrato.dataCriacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ContratoPDF;