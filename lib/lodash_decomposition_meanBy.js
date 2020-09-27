function meanBy(array, iteratee) {
  return baseMean(array, getIteratee(iteratee, 2));
}


	  function baseMean(array, iteratee) {
	    var length = array == null ? 0 : array.length;
	    return length ? (baseSum(array, iteratee) / length) : NAN;
	  }



	    function baseSum(array, iteratee) {
	    var result,
	        index = -1,
	        length = array.length;

	    while (++index < length) {
	      var current = iteratee(array[index]);
	      if (current !== undefined) {
	        result = result === undefined ? current : (result + current);
	      }
	    }
	    return result;
	  }



		    function iteratee(func) {
		      return baseIteratee(typeof func == 'function' ? func : baseClone(func, CLONE_DEEP_FLAG));
		    }



			    function baseIteratee(value) {
			      // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
			      // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
			      if (typeof value == 'function') {
			        return value;
			      }
			      if (value == null) {
			        return identity;
			      }
			      if (typeof value == 'object') {
			        return isArray(value)
			          ? baseMatchesProperty(value[0], value[1])
			          : baseMatches(value);
			      }
			      return property(value);
			    }
		    




    function medianBy(array) {
      return math.median(arr);
    }