from flask import Flask, request, render_template
import numpy 
import json
import tensorflow as tf
app = Flask(__name__)
model = tf.keras.models.Sequential([
  tf.keras.layers.Flatten(input_shape=(3375, 1)),
  tf.keras.layers.Dense(3375, activation='relu'),
  tf.keras.layers.Dense(3375, activation='relu'),
  tf.keras.layers.Dense(8),
])
a = []
b = []
loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
model.compile(optimizer='adam',
              loss=loss_fn,
              metrics=['accuracy'])
lictus = ["Он.txt", "Она.txt", "Они.txt", "С.txt", "Транспорт.txt", "Ты.txt", "И.txt", "Я.txt"]
for i in range(8):
    with open(lictus[i], 'r') as f:
        for rtg in f:
            for line in rtg.replace('"', "").replace("'", "").split("@"):
                line = line.split("!")[:-1]
                line = list(map(float, line))
                if line:
                    b.append(i)
                    t = numpy.asarray(line)
                    a.append(t)
b = numpy.asarray(b)
a = numpy.asarray(a)
print(b, a)
model.fit(
    tf.stack(a),
    tf.stack(b),
    epochs=3,
)


@app.route('/index', methods=['GET', 'POST'])
def index():
    if request.method == "POST":
        jsondata = request.get_json()["massive"][0]
        array = numpy.asarray([jsondata])
        predictions = model(array).numpy()
        res = tf.nn.softmax(predictions).numpy()[0]
        print(res)
    return render_template('index.html')


app.run(host='0.0.0.0', port=81)

