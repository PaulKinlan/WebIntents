/**
 * jquery.loremipsum.1.0.rc0 
 * 
 * Copyright (c) 2008-2009 Chris Thatcher (claypooljs.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 * 
 * jQuery.jsPath Lorimipsum 
 * 
 * 	Ported with love (and little change or effort) from the 
 *	Django Python Application Framework (djangoproject.com)
 *
 *	"""
 *	Utility functions for generating "lorem ipsum" Latin text.
 *	"""
 *
 *          depends on jquery-jspath 
 *  ( http://github.com/thatcher/jquery-jspath )
 */
(function($, _){

	var COMMON_P = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

	var WORDS = ['exercitationem', 'perferendis', 'perspiciatis', 'laborum', 'eveniet',
        'sunt', 'iure', 'nam', 'nobis', 'eum', 'cum', 'officiis', 'excepturi',
        'odio', 'consectetur', 'quasi', 'aut', 'quisquam', 'vel', 'eligendi',
        'itaque', 'non', 'odit', 'tempore', 'quaerat', 'dignissimos',
        'facilis', 'neque', 'nihil', 'expedita', 'vitae', 'vero', 'ipsum',
        'nisi', 'animi', 'cumque', 'pariatur', 'velit', 'modi', 'natus',
        'iusto', 'eaque', 'sequi', 'illo', 'sed', 'ex', 'et', 'voluptatibus',
        'tempora', 'veritatis', 'ratione', 'assumenda', 'incidunt', 'nostrum',
        'placeat', 'aliquid', 'fuga', 'provident', 'praesentium', 'rem',
        'necessitatibus', 'suscipit', 'adipisci', 'quidem', 'possimus',
        'voluptas', 'debitis', 'sint', 'accusantium', 'unde', 'sapiente',
        'voluptate', 'qui', 'aspernatur', 'laudantium', 'soluta', 'amet',
        'quo', 'aliquam', 'saepe', 'culpa', 'libero', 'ipsa', 'dicta',
        'reiciendis', 'nesciunt', 'doloribus', 'autem', 'impedit', 'minima',
        'maiores', 'repudiandae', 'ipsam', 'obcaecati', 'ullam', 'enim',
        'totam', 'delectus', 'ducimus', 'quis', 'voluptates', 'dolores',
        'molestiae', 'harum', 'dolorem', 'quia', 'voluptatem', 'molestias',
        'magni', 'distinctio', 'omnis', 'illum', 'dolorum', 'voluptatum', 'ea',
        'quas', 'quam', 'corporis', 'quae', 'blanditiis', 'atque', 'deserunt',
        'laboriosam', 'earum', 'consequuntur', 'hic', 'cupiditate',
        'quibusdam', 'accusamus', 'ut', 'rerum', 'error', 'minus', 'eius',
        'ab', 'ad', 'nemo', 'fugit', 'officia', 'at', 'in', 'id', 'quos',
        'reprehenderit', 'numquam', 'iste', 'fugiat', 'sit', 'inventore',
        'beatae', 'repellendus', 'magnam', 'recusandae', 'quod', 'explicabo',
        'doloremque', 'aperiam', 'consequatur', 'asperiores', 'commodi',
        'optio', 'dolor', 'labore', 'temporibus', 'repellat', 'veniam',
        'architecto', 'est', 'esse', 'mollitia', 'nulla', 'a', 'similique',
        'eos', 'alias', 'dolore', 'tenetur', 'deleniti', 'porro', 'facere',
        'maxime', 'corrupti'];

	var COMMON_WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
        'adipisicing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt',
        'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua'];

    

	_.words = function(count, common){
	    /*"""
	    Returns a string of `count` lorem ipsum words separated by a single space.
	
	    If `common` is True, then the first 19 words will be the standard
	    'lorem ipsum' words. Otherwise, all words will be selected randomly.
	    """*/
		common = common?true:false;
	    var word_list;
	    if (common)
	        word_list = COMMON_WORDS;
	    else
	        word_list = [];
	        
	    var c = word_list.length;
	    if (count > c){
	    	word_list = word_list.concat( randomSample(WORDS, count-c) );
	    }else{
	        word_list = word_list.slice(0,count);
	    } return word_list.join(' ');
	};
    _.fn.words = function(){
        var args = arguments;
        this.each(function(){
            this.$ = _.words.apply(_,args);
        });
    };

	_.titled = function(count, common){
		//a convience function to upper case the resulting words
		var title = [],
		    words = _.words(count, common);
		$.each(words.split(' '), function(pos, word){
			title.push(word.charAt(0).toUpperCase()+word.slice(1));
		}); return title.join(' ');
	};
    _.fn.titled = function(){
        var args = arguments;
        this.each(function(){
            this.$ = _.titled.apply(_,args);
        });
    };
    
	 _.sentence = function(common){
	    /*"""
	    Returns a randomly generated sentence of lorem ipsum text.
	
	    The first word is capitalized, and the sentence ends in either a period or
	    question mark. Commas are added at random.
	    """*/
	    //# Determine the number of comma-separated sections and number of words in
	    //# each section for this sentence.
        common = common?true:false;
	    var sections = [],
	        range = randomNumber(8,15);
        sections = _.words(range, common).split(' ');
	    for(var i=0;i<sections.length-1;i++){
	    	if(Math.random() < 0.15){
                sections[i] += ',';
            }
	    } 
        var s = sections.join(' ');
	    //# Convert to sentence case and add end punctuation.
	    return (s.charAt(0).toUpperCase() + s.slice(1) + '.');
	};
    _.fn.sentence = function(){
        var args = arguments;
        this.each(function(){
            this.$ = _.sentence.apply(_,args);
        });
    };

	_.paragraph = function(common){
	    /*"""
	    Returns a randomly generated paragraph of lorem ipsum text.
	
	    The paragraph consists of between 3 and 6 sentences, inclusive.
	    """*/
        common = common?true:false;
	    var paragraph = [],
	        range = randomNumber(3,6),
            i;
        if(common){   
            paragraph.push(COMMON_P);
        }else{
    	    for(i=0;i<range;i++){
    	    	paragraph.push(_.sentence());
    	    } 
        }
        return paragraph.join(' ');
	};
    _.fn.paragraph = function(){
        var args = arguments;
        this.each(function(){
            this.$ = _.paragraph.apply(_,args);
        });
    };

	_.paragraphs = function(count, common){
	    /*"""
	    Returns a list of paragraphs as returned by paragraph().
	
	    If `common` is True, then the first paragraph will be the standard
	    'lorem ipsum' paragraph. Otherwise, the first paragraph will be random
	    Latin text. Either way, subsequent paragraphs will be random Latin text.
	    """*/
        common = common?true:false;
	    var paras = [];
	    for ( var i=0; i<count;i++){
	        if (common && i == 0)
	            paras = paras.concat(COMMON_P);
	        else
	            paras = paras.concat(_.paragraph());
	    } return paras;
	};
    _.fn.paragraphs = function(){
        var args = arguments;
        this.each(function(){
            this.$ = _.paragraphs.apply(_,args);
        });
    };
	
	var randomSample = function(array, count){
		var i,randomArray = [];
		for(i=0;i<count;i++){
			randomArray.push(array[randomNumber(0, array.length)]);
		} 
        return randomArray;
	};
	
	var randomNumber = function(startRange, endRange){
		var range = endRange - startRange,
        randomNumber = endRange - Math.ceil(Math.random()*range);
		return randomNumber;
	};
	
	var randomLetter = function(letters){
		return letters.charAt(randomNumber(0, letters.length-1));
	};
})(jQuery, jsPath);