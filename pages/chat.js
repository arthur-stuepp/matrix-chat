import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React, { useEffect, useState } from 'react';
import appConfig from '../config.json';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';

const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzI4Mjg4MSwiZXhwIjoxOTU4ODU4ODgxfQ.zYTfZiRlXi2TKFdxs0KB7PgyLjacjAyA5dbcLPJT2mc';
const SUPABASE_URL = 'https://zhyjbjpbhwijdiiubkhx.supabase.co';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

function escutaMensagensEmTempoReal(adicionaMensagem) {
  return supabaseClient
    .from('message')
    .on('INSERT', (respostaLive) => {
      adicionaMensagem(respostaLive.new);
    })
    .subscribe();
}

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const route = useRouter();
  const user = route.query.username;

  useEffect(() => {
    supabaseClient 
      .from('message')
      .select('*')
      .order('id', { ascending: false })
      .then(({ data }) => {
        setMessageList(data);
      });
    const subscription = escutaMensagensEmTempoReal((novaMensagem) => {
      console.log('Nova mensagem:', novaMensagem);
      console.log('listaDeMensagens:', messageList);
      // Quero reusar um valor de referencia (objeto/array) 
      // Passar uma função pro setState

      // setListaDeMensagens([
      //     novaMensagem,
      //     ...listaDeMensagens
      // ])
      setMessageList((valorAtualDaLista) => {
        console.log('valorAtualDaLista:', valorAtualDaLista);
        return [
          novaMensagem,
          ...valorAtualDaLista,
        ]
      });
    });

    return () => {
      subscription.unsubscribe();
    }
  }, []);

  function handleNewMesagge(newMessage) {
    const message = {
      // id: messageList.length,
      from: user,
      text: newMessage,
    };
    supabaseClient
      .from('message')
      .insert([message])
      .then(({ data }) => {

      });
    setMessage('');
  }
  return (
    <Box
      styleSheet={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: appConfig.theme.colors.primary[500],
        backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundBlendMode: 'multiply',
        color: appConfig.theme.colors.neutrals['000'],
      }}
    >
      <Box
        styleSheet={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
          borderRadius: '5px',
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: '100%',
          maxWidth: '95%',
          maxHeight: '95vh',
          padding: '32px',
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: 'relative',
            display: 'flex',
            flex: 1,
            height: '80%',
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: 'column',
            borderRadius: '5px',
            padding: '16px',
          }}
        >
          <MessageList message={messageList} />

          <Box
            as='form'
            styleSheet={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TextField
              value={message}
              onChange={(e) => {
                setMessage(e.currentTarget.value);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleNewMesagge(message);
                  e.preventDefault();
                }
              }}
              placeholder='Insira sua mensagem aqui...'
              type='textarea'
              styleSheet={{
                width: '100%',
                border: '0',
                resize: 'none',
                borderRadius: '5px',
                padding: '6px 8px',
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: '12px',
                color: appConfig.theme.colors.neutrals[200],
              }}
            />
            <ButtonSendSticker
              onStickerClick={(sticker) => {
                handleNewMesagge(':sticker' + sticker);
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Header() {
  return (
    <>
      <Box
        styleSheet={{
          width: '100%',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text variant='heading5'>Chat</Text>
        <Button
          variant='tertiary'
          colorVariant='neutral'
          label='Logout'
          href='/'
        />
      </Box>
    </>
  );
}

function MessageList(props) {
  return (
    <Box
      tag='ul'
      styleSheet={{
        overflow: 'scroll',
        display: 'flex',
        flexDirection: 'column-reverse',
        flex: 1,
        color: appConfig.theme.colors.neutrals['000'],
        marginBottom: '16px',
      }}
    >
      {props.message.map((value) => {
        return (
          <Text
            key={value.id}
            tag='li'
            styleSheet={{
              borderRadius: '5px',
              padding: '6px',
              marginBottom: '12px',
              hover: {
                backgroundColor: appConfig.theme.colors.neutrals[700],
              },
            }}
          >
            <Box
              styleSheet={{
                marginBottom: '8px',
              }}
            >
              <Image
                styleSheet={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'inline-block',
                  marginRight: '8px',
                }}
                src={`https://github.com/${value.from}.png`}
              />
              <Text tag='strong'>{value.from}</Text>
              <Text
                styleSheet={{
                  fontSize: '10px',
                  marginLeft: '8px',
                  color: appConfig.theme.colors.neutrals[300],
                }}
                tag='span'
              >
                {new Date().toLocaleDateString()}
              </Text>
            </Box>
            {value.text.startsWith(':sticker') ? (
              <Image src={value.text.replace(':sticker', '')} />
            ) : (
              value.text
            )}
          </Text>
        );
      })}
    </Box>
  );
}
