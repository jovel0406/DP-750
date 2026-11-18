export const ir = (secao, param) => { window.location.hash = '/' + [secao, param].filter(Boolean).join('/'); };
