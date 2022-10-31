// called when API server is first started
async function initial(Role, Course, Quiz) {
  await Role.create({ id: 1, name: 'user' });
  await Role.create({ id: 2, name: 'admin' });

  await Course.create({ id: 1, name: 'Heart Fundamentals' });
  await Course.create({ id: 2, name: 'ECG Introduction' });
  await Course.create({ id: 3, name: 'Parts Of The ECG Explained' });
  await Course.create({ id: 4, name: 'How To Read An ECG' });
  await Course.create({ id: 5, name: 'How To Document An ECG' });
  await Course.create({ id: 6, name: 'Conditions' });

  await Quiz.create({ id: 1, name: 'Heart Fundamentals' });
  await Quiz.create({ id: 2, name: 'ECG Introduction' });
  await Quiz.create({ id: 3, name: 'Parts Of The ECG Explained' });
  await Quiz.create({ id: 4, name: 'How To Read An ECG' });
  await Quiz.create({ id: 5, name: 'How To Document An ECG' });
  await Quiz.create({ id: 6, name: 'Conditions' });
}
module.exports = initial;
