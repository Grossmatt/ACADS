var myKnob1 = pureknob.createKnob(175 , 175);
var myKnob2 = pureknob.createKnob(175 , 175);


myKnob1.setProperty('readonly',true);
myKnob1.setProperty('needle',true);
myKnob1.setProperty('colorFG','#000000');
myKnob1.setProperty('colorBG','#CE6565');
myKnob1.setProperty('valMin',-40);
myKnob1.setProperty('valMax',40);
myKnob1.setValue(0);

myKnob2.setProperty('readonly',true);
myKnob2.setProperty('needle',true);
myKnob2.setProperty('colorFG','#000000');
myKnob2.setProperty('colorBG','#CE6565');
myKnob2.setProperty('valMin',-40);
myKnob2.setProperty('valMax',40);
myKnob2.setValue(0);

var node1 = myKnob1.node();
var elem1 = document.getElementById('motor-position-gauge1');

var node2 = myKnob2.node();
var elem2 = document.getElementById('motor-position-gauge2');

elem1.appendChild(node1);
elem2.appendChild(node2);

var listener1 = function(myKnob1, value) {
  console.log(value);
};

var listener2 = function(myKnob2, value) {
  console.log(value);
};

myKnob1.addListener(listener1);
myKnob2.addListener(listener2);