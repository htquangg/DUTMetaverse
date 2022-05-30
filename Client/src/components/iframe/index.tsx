import React from 'react';

const Iframe = ({ url }) => {
  return (
    <div className="bg-loadgame h-100">
      {!!url && (
        <div
          dangerouslySetInnerHTML={{
            __html: `<iframe src=${url} width="100%" height="100%" id="game-iframe" allowFullScreen></iframe>`,
          }}
        />
      )}
    </div>
  );
};

export default React.memo(Iframe);
