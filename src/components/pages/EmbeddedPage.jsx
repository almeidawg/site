
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';

const EmbeddedPage = ({ src, title }) => {
  const [loading, setLoading] = React.useState(true);

  return (
    <div className="h-full w-full flex flex-col">
       <Helmet>
            <title>{title}</title>
            <meta name="description" content={`Página integrada: ${title}`} />
        </Helmet>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando {title}...</p>
          </div>
        </div>
      )}
      <iframe
        src={src}
        title={title}
        className="w-full h-full border-0"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

export default EmbeddedPage;
