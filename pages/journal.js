import React, { useState, useEffect } from "react";
import {
  Flex,
  Heading,
  Box,
  InputGroup,
  InputLeftElement,
  Input,
  Button,
  Text,
  IconButton,
  Stack,
  Divider,
  Spacer,
  Menu,
  Avatar,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR,
  AuthAction,
} from "next-firebase-auth";
import getAbsoluteURL from "../utils/getAbsoluteURL";
import {
  AddIcon,
  DeleteIcon,
  ExternalLinkIcon,
  QuestionOutlineIcon,
} from "@chakra-ui/icons";
import firebase from "firebase/app";
import "firebase/firestore";
import DarkModeSwitch from "../components/DarkModeSwitch";
import EmojiPanel from "../components/EmojiPanel";
import EmojiCard from "../components/EmojiCard";

const Emoji = () => {
  const AuthUser = useAuthUser();
  const [context, setContext] = useState("");
  const [emojis, setEmojis] = useState([]);

  const firebaseDocPrototype = {
    emoji: "🥘",
    context: "ate a banana for breakfast",
    timestamp: "1/1/2020",
  };

  const getTimeID = () => {
    // This gets us the timeID for when an emoji is pressed for easily identifying the emoji and context
    // This gets is the time in seconds
    const seconds = Math.floor(Date.now() / 1000);
    return seconds.toString();
  };

  useEffect(() => {
    AuthUser.id &&
      firebase
        .firestore()
        .collection(AuthUser.id)
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
          setEmojis(snapshot.docs.map((doc) => doc.data().emoji));
        });
  });

  const Today = () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const dateObj = new Date();
    const month = monthNames[dateObj.getMonth()];
    const day = String(dateObj.getDate()).padStart(2, "0");
    const year = dateObj.getFullYear();
    const today = month + "\n" + day + ", " + year;
    return today;
  };

  // called on 'add emoji' button press
  // The time acts like a unique identifier for each emoji
  const sendData = (emoji) => {
    const timeID = getTimeID();
    console.log(emoji, timeID);
    try {
      // try to update doc
      firebase
        .firestore()
        // each user gets their own firestore collection
        .collection(AuthUser.id)
        // set the collection name to the timeID which is unique to when an emoji is pressed so that we can easily delete it later on
        .doc(timeID)
        .set({
          emoji: emoji,
          // context: context,
          timeID: timeID,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(console.log("Data was successfully sent to cloud firestore!"));
    } catch (error) {
      console.log(error);
    }
  };

  const deleteEmoji = (t) => {
    try {
      firebase
        .firestore()
        .collection(AuthUser.id)
        .doc(t)
        .delete()
        .then(console.log("Data was successfully deleted!"));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {/* navbar */}
      <Box
        id="navbar"
        position="fixed"
        bg={useColorModeValue("gray.100", "gray.800")}
        px={4}
        borderBottom="1px"
        borderColor={useColorModeValue("gray.200", "gray.700")}
        w="100%"
        backdropFilter="saturate(180%) blur(5px)"
      >
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <Button variant={"solid"} colorScheme={"teal"} size={"sm"}>
            Dailymoji
          </Button>
          <Heading id="welcomeText">
            {"Welcome back, " + AuthUser.displayName}
          </Heading>
          <Flex alignItems={"center"}>
            <Menu>
              <Flex justify="space-between" w="100%" align="center">
                <Flex>
                  <DarkModeSwitch />
                  <IconButton
                    ml={2}
                    // onClick={
                    //    TODO - open a modal with info like app developers
                    // }
                    icon={<QuestionOutlineIcon />}
                  />
                  <IconButton
                    ml={2}
                    onClick={AuthUser.signOut}
                    icon={<ExternalLinkIcon />}
                  />
                </Flex>
              </Flex>
              <Avatar
                ml={2}
                size={"sm"}
                src={
                  // get user image from firebase
                  AuthUser.photoURL
                }
              />
            </Menu>
          </Flex>
        </Flex>
      </Box>

      <Flex
        flexDir="column"
        maxW={800}
        align="center"
        // justify="center"
        minH="100vh"
        mx="auto"
        px={4}
        id="main"
      >
        <Heading id="dateText">{Today()}</Heading>

        <InputGroup mt={8}>
          {/* <InputLeftElement
            pointerEvents="none"
            children={<AddIcon color="gray.300" />}
          /> */}
          {/* <Input
            id="emojiInput"
            type="text"
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add emoji"
          /> */}

          {/* <Button ml={2} onClick={() => sendData()}>
            Add Emoji
          </Button> */}
        </InputGroup>

        <Flex position="absolute" bottom="50">
          <EmojiPanel sendData={sendData} getTimeID={getTimeID} />
        </Flex>

        {emojis.map((t, i) => {
          return (
            <>
              {i > 0}
              <Flex
                key={i}
                w="100%"
                align="center"
                bg={useColorModeValue("gray.200", "gray.700")}
                id="card"
                p="4"
                m="4"
                boxShadow="lg"
                borderRadius="lg"
              >
                <Text fontWeight="semibold">{t}</Text>
                <Spacer />
                <Text fontSize={{ base: "sm" }} maxW={"80%"}>
                  context
                </Text>
                <Spacer />
                <IconButton
                  onClick={() => deleteEmoji(t)}
                  icon={<DeleteIcon />}
                />
              </Flex>
            </>
          );
        })}
      </Flex>
    </>
  );
};

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, req }) => {
  // Optionally, get other props.
  // You can return anything you'd normally return from
  // `getServerSideProps`, including redirects.
  // https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering
  const token = await AuthUser.getIdToken();
  const endpoint = getAbsoluteURL("/api/example", req);
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: token || "unauthenticated",
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      `Data fetching failed with status ${response.status}: ${JSON.stringify(
        data
      )}`
    );
  }
  return {
    props: {
      favoriteColor: data.favoriteColor,
    },
  };
});

export default withAuthUser({
  // to make sure user logs in before accessing this page
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN,
})(Emoji);
