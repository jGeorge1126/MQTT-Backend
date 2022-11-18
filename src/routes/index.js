const { db, getAuth2 } = require("../firebase");
const { getAuth } = require('firebase-admin/auth');

const { Router } = require("express");
const router = Router();

router.get("/", async (req, res) => {
  try {
    const querySnapshot = await db.collection("contacts").get();
    const contacts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.render("index", { contacts });
  } catch (error) {
    console.error(error);
  }
});

// update Account Settings (User Authentication Email and Password)
/**
 * since 2022.11.17
 * author richard
 */
router.post('/updateEmailAndPassword', function(req, res) {
  console.log("req: ", req.body);
  const uid = req.body.id// Specify the user's uid
  console.log("uid: ", uid);
  getAuth()
    .updateUser(uid, {
      email: req.body.email,
      password: req.body.password
    })
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log('Successfully updated user', userRecord.toJSON());
    })
    .catch((error) => {
      console.log('Error updating user:', error);
    });
  res.send('sucess');
})

router.get('/changebatterystatus', async (req, res) => {
  console.log(req.query);
  var params = req.query;
  // client.publish("", message, [options], [callback])
  if(params.battery == 'true'){
    await client.publish(params.scooterID,"{'a':62}");
  } else if(params.battery == 'false'){
    await client.publish(params.scooterID,"{'a':60}");
  }
  res.send("Success")
})

router.get('/changelightstatus', async (req, res) => {
  console.log(req.query);
  var params = req.query;
  // client.publish("", message, [options], [callback])
  if(params.lights == 'true'){
    await client.publish(params.scooterID,"{'a':37,'d':1}");
  } else if(params.lights == 'false'){
    await client.publish(params.scooterID,"{'a':37,'d':0}");
  }
  res.send("Success")
})

router.get('/changealarmstatus', async (req, res) => {
  console.log(req.query);
  var params = req.query;
  // client.publish("", message, [options], [callback])
  if(params.alarm == 'true'){
    await client.publish(params.scooterID,"{'a':28}");
  }
  res.send("Success")
})

router.get('/changepowerstatus', async (req, res) => {
  console.log(req.query);
  var params = req.query;
  // client.publish("", message, [options], [callback])
  if(params.power == 'true'){
    await client.publish(params.scooterID,"{'a':1}");
  } else if(params.power == 'false'){
    await client.publish(params.scooterID,"{'a':3}");
  }
  res.send("Success")
})

router.get('/scootersetting', async (req, res) => {
  console.log(req.query);
  var params = req.query;
  await client.publish(params.scooterID,params.payload);
  res.send("Success")
})

router.post("/new-contact", async (req, res) => {
  const { firstname, lastname, email, phone } = req.body;
  await db.collection("contacts").add({
    firstname,
    lastname,
    email,
    phone,
  });
  res.redirect("/");
});

router.get("/delete-contact/:id", async (req, res) => {
  await db.collection("contacts").doc(req.params.id).delete();
  res.redirect("/");
});

router.get("/edit-contact/:id", async (req, res) => {
  const doc = await db.collection("contacts").doc(req.params.id).get();
  res.render("index", { contact: { id: doc.id, ...doc.data() } });
});

router.post("/update-contact/:id", async (req, res) => {
  const { firstname, lastname, email, phone } = req.body;
  const { id } = req.params;
  await db
    .collection("contacts")
    .doc(id)
    .update({ firstname, lastname, email, phone });
  res.redirect("/");
});

module.exports = router;
