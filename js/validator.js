/**
 * Reader's Guide (validator.js)
 * Purpose: Lightweight JSON schema/shape validator used to sanity-check fetched data.
 * API:
 *   - JSONValidator.assertShape(obj, shape, ctx?): throws if obj doesn't match shape.
 *   - JSONValidator.loadJSON(url, shape?): fetches JSON and optionally validates.
 * Notes: Only comments were added; logic untouched.
 */
;(function (global) {

// Function: assertShape — what it does: see inline code; this comment is for readability only.
    function assertShape(obj, shape, ctx){ctx=ctx||"data";function f(m){console.error("[JSON Validation] "+ctx+": "+m);throw new Error(m)}
    if(Array.isArray(shape)){ if(!Array.isArray(obj)) f("Expected array"); var it=shape[0]; obj.forEach(function(v,i){assertShape(v,it,ctx+"["+i+"]")}); return true;}
    if(typeof shape==="object"&&shape){ if(typeof obj!=="object"||!obj) f("Expected object");
      Object.keys(shape).forEach(function(k){ if(!(k in obj)) f("Missing key '"+k+"'"); var ty=shape[k];
        if(ty===String && typeof obj[k]!=="string") f("'"+k+"' must be string");
        if(ty===Number && typeof obj[k]!=="number") f("'"+k+"' must be number");
        if(ty===Boolean && typeof obj[k]!=="boolean") f("'"+k+"' must be boolean");
        if(Array.isArray(ty) || (typeof ty==="object"&&ty)) assertShape(obj[k],ty,ctx+"."+k);
      }); return true;}
    return true;}

// Function: loadJSON — what it does: see inline code; this comment is for readability only.
    function loadJSON(url, shape){ return fetch(url).then(function(r){ if(!r.ok) throw new Error("Failed to load "+url+": "+r.status); return r.json();})
      .then(function(d){ if(shape) assertShape(d,shape,url); return d;});}
    global.JSONValidator={assertShape:assertShape,loadJSON:loadJSON};
  })(window);
  