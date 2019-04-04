app.directive("iprRandomQuote", ['$q', '_', ($q, _) => {

  let quotes = [
    '"I dream of a better tomorrow, where chickens can cross the road and not be questioned about their motives."',
    '"I changed all my passwords to \'incorrect\'. So my computer just tells me when I forgot.',
    '"No I didn\'t trip, the floor looked like it needed a hug."',
    '"Whatever you do in life give 100%.....unless you\'re giving blood."',
    '"One time at the beach this guy was swimming in the ocean yelling Help! Shark! Help! I just laughed, I knew that shark wasn\'t going to help him.',
    '"Procrastinator? No, I just wait until the last second to do my work because I will be older, therefore wiser."',
    '"I do 5 sit-ups every morning. May not sound like much, but there is only so many times you can hit the snooze button...',
    '"I feel like getting something done today, so I\'m just going to sit here until the feeling passes."',
    '"I was complimented on my driving. Someone left a note on my windshield that said, \'Parking Fine.\'',
    '"I just dropped my laptop off the boat.....It\'s a Dell, rolling in the deep."',
    '"Why do banks lock their pens to the desk? If I\'m trusting you with my money, don\'t you think you can trust me with a pen?"',
    '"I really like ceilings......I guess you could call me a ceiling fan."',
    'Grammar is somewhat important. Commas do save lives for instance: "Let\'s eat grandpa." "Lets eat, grandpa."',
    '"I was planning to do something today, but I haven\'t finished doing nothing from yesterday."',
    '"Light travels faster than sound. This is why some people appear bright, until you hear them talk."',
    '"The dictionary is the only place where success comes before work."',
    '"Better late then never, but never late is better."',
    '"I wish real life was like cartoons. I could wear the same outfit and nobody would care."',
    '"I haven\'t seen any statuses about Ninjas lately....well played Ninjas."',
    'Did you hear about the restaurant on the moon? Great food, no atmosphere.',
    'What do you call a fake noodle? An Impasta.',
    'How many apples grow on a tree? All of them.',
    'Want to hear a joke about paper? Never mind it\'s tearable.',
    'I just watched a program about beavers. It was the best dam program I\'ve ever seen.',
    'Why did the coffee file a police report? It got mugged.',
    'How does a penguin build it\'s house? Igloos it together.',
    'Why did the scarecrow win an award? Because he was outstanding in his field.',
    'Why don\'t skeletons ever go trick or treating? Because they have no body to go with.',
    'What do you call an elephant that doesn\'t matter? An irrelephant',
    'Want to hear a joke about construction? I\'m still working on it.',
    'Why couldn\'t the bicycle stand up by itself? It was two tired.',
    'What did the grape do when he got stepped on? He let out a little wine.',
    'I wouldn\'t buy anything with velcro. It\'s a total rip-off.',
    'The shovel was a ground-breaking invention.',
    '5/4 of people admit that they’re bad with fractions.',
    'Two goldfish are in a tank. One says to the other, "do you know how to drive this thing?"',
    'The rotation of earth really makes my day.',
    'I thought about going on an all-almond diet. But that\'s just nuts',
    'Why do you never see elephants hiding in trees? Because they\'re so good at it.',
    'I used to work in a shoe recycling shop. It was sole destroying.',
    'I don’t play soccer because I enjoy the sport. I’m just doing it for kicks.',
    'This graveyard looks overcrowded. People must be dying to get in there.',
    'What\'s brown and sticky? A stick.',
    'The rotation of earth really makes my day.',
    'What do you call a man with a rubber toe? Roberto.',
    'The shovel was a ground-breaking invention',
    'I wouldn\'t buy anything with velcro. It\'s a total rip-off.',
    'Why couldn\'t the bicycle stand up by itself? It was two tired.',
    'What do you call an elephant that doesn\'t matter? An irrelephant',
    'Why don\'t skeletons ever go trick or treating? Because they have no body to go with.',
    'Why did the scarecrow win an award? Because he was outstanding in his field.',
    'Did you hear about the restaurant on the moon? Great food, no atmosphere.'
  ];


  return {
    restrict: 'E',
    transclude: false,
    templateUrl: 'ipr-random-quote/ipr-random-quote.html',
    link: (scope, element, attr) => {

      scope.quote = quotes[_.random(0,quotes.length)];

    } // end link
  } // end return

}]);
