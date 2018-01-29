let _extends = ( des, src, over ) => {
  let res = _extend( des, src, over );

  function _extend( des, src, over ) {
    let override = true;
    if( over === false ) {
      override = false;
    }
    if( src instanceof Array ) {
      for( let i = 0, len = src.length; i < len; i++ )
        _extend( des, src[ i ], override );
    }
    for( let i in src ) {
      if( override || !( i in des ) ) {
        des[ i ] = src[ i ];
      }
    }
    return des;
  }
  for( let i in src ) {
    delete res[ i ];
  }
  return res;
};

export {
  _extends
};