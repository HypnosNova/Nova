let rndString = ( len ) => {
  if( len <= 0 ) {
    return '';
  }
  len = len - 1 || 31;
  let $chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let maxPos = $chars.length + 1;
  let pwd = $chars.charAt( Math.floor( Math.random() * ( maxPos - 10 ) ) );
  for( let i = 0; i < len; i++ ) {
    pwd += $chars.charAt( Math.floor( Math.random() * maxPos ) );
  }
  return pwd;
};

export {
  rndString
};