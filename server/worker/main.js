const logger = require('../logger');

const kafka = require('no-kafka');

let consumer;
let broker_topic;
if (process.env.KAFKA_ENABLED === 'true') {
  consumer = new kafka.SimpleConsumer({
    connectionString: process.env.KAFKA_URL, // should match `listeners` SSL option in Kafka config
    ssl: {
      cert: process.env.KAFKA_CLIENT_CERT,
      key: process.env.KAFKA_CLIENT_CERT_KEY
    }
  });
  broker_topic = process.env.KAFKA_PREFIX + process.env.KAFKA_TOPIC_ALL;
} else {
  logger.print("Kafka disabled...");
}

// data handler function can return a Promise
const dataHandler = function (messageSet, topic, partition) {
  messageSet.forEach(function (m) {
    //TODO: handle this properly for tenants - needs more thought
    //short term, get a list of triggers from DB and make a dictionary
    //for each received event if there is a trigger in the dictionary run trigger's workflow
    logger.print(topic, partition, m.offset, m.message.key.toString('utf8') + ':' + m.message.value.toString('utf8'));
  });
};

if (!consumer) {
  return process.exit(0);
}

return consumer.init().then(function () {
  // Subscribe partitions 0 and 1 in a topic:
  return consumer.subscribe(broker_topic, [0], dataHandler);
});

