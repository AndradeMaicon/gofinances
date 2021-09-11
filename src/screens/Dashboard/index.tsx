import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'styled-components';
import { useAuth } from '../../hooks/auth';

import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';

import { 
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  LogoutButton,
  Icon,
  HighlightCards,
  Transaction,
  Title,
  TransactionsList,
  LoadingContainer,
} from './styles'

export interface DataListProps extends TransactionCardProps {
  id: string
}

interface HighlightProps {
  amount: string;
  lastTransaction: string;
}

interface HighlightData {
  entries: HighlightProps;
  expensives: HighlightProps;
  total: HighlightProps;
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);

  const theme = useTheme();
  const { signOut, user } = useAuth()

  function getLastTransactionDate(collection: DataListProps[], type: 'down' | 'up') {
    const filter = collection.filter(transaction => transaction.type === type)

    if(filter.length === 0){
      return 0;
    }

    const map = filter.map(transaction => new Date(transaction.date).getTime())
    const max = Math.max.apply(Math, map)
    const date = new Date(max)

    const lastTransactionFormatted = Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
    }).format(new Date(date))

    return lastTransactionFormatted;
  }

  async function loadTransaction() {
    const dataKey = `@gofinances:transactions_user:${user.id}`
    const resp = await AsyncStorage.getItem(dataKey);
    const transactions = resp ? JSON.parse(resp) : [];

    let entriesTotal = 0;
    let expensiveTotal = 0;

    const transactionsFormatted: DataListProps[] = transactions.map(
      (item: DataListProps) => {

        if(item.type === 'up'){
          entriesTotal += Number(item.amount);
        } else {
          expensiveTotal += Number(item.amount);
        }

        const amount = Number(item.amount).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })

        const date = Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        }).format(new Date(item.date))

        return {
          id: item.id,
          name: item.name,
          amount,
          type: item.type,
          category: item.category,
          date,
        }
      
      });

      setTransactions(transactionsFormatted);
      
      const lastTransactionEntries = getLastTransactionDate(transactions, 'up');
      const lastTransactionExpensives = getLastTransactionDate(transactions, 'down');
      const totalInterval = Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
      }).format(new Date())

      const total = entriesTotal - expensiveTotal;

      const currentDate = total >= 0 ? `01 à ${totalInterval}` : `Não houveram entradas`


      setHighlightData({
        entries: {
          amount: entriesTotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }),
          lastTransaction: lastTransactionEntries !== 0 
            ? `Última entrada dia ${lastTransactionEntries}`
            : 'Nenhuma transação encontrada'
        },
        expensives: {
          amount: expensiveTotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }),
          lastTransaction: lastTransactionExpensives !== 0
            ? `Última saída dia ${lastTransactionExpensives}`
            : 'Nenhuma transação encontrada'
        },
        total: {
          amount: total.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }),
          lastTransaction: currentDate
        }
      })
    
      setIsLoading(false)
  }

  function handleSignOut() {
    signOut()
  }

  useEffect(() => {
    loadTransaction()
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadTransaction()
    }, [])
  );

  return (
      <Container>
        {
          isLoading ? 
            <LoadingContainer>
              <ActivityIndicator 
                color={theme.colors.primary}
                size='large'
              /> 
            </LoadingContainer>
          :
            <>
              <Header>
                <UserWrapper>
                  <UserInfo>
                    <Photo source={{ uri: user.photo }}/>
                    <User>
                      <UserGreeting>Olá,</UserGreeting>
                      <UserName>{user.name}</UserName>
                    </User>
                  </UserInfo>

                  <LogoutButton onPress={handleSignOut}>
                    <Icon name='power'/>
                  </LogoutButton>
                </UserWrapper>
              </Header>
              
              <HighlightCards>
                <HighlightCard
                  type='up'
                  title='Entradas'
                  amount={highlightData.entries.amount}
                  lastTransaction={highlightData.entries.lastTransaction}
                />
                <HighlightCard
                  type='down' 
                  title='Saídas'
                  amount={highlightData.expensives.amount}
                  lastTransaction={highlightData.expensives.lastTransaction}
                />
                <HighlightCard
                  type='total' 
                  title='Total'
                  amount={highlightData.total.amount}
                  lastTransaction={highlightData.total.lastTransaction}
                />
              </HighlightCards>

              <Transaction>
                <Title>Listagem</Title>

                <TransactionsList 
                  data={transactions}
                  keyExtractor={item => item.id}
                  renderItem={({item}) => <TransactionCard data={item}/>}
                />
                
              </Transaction>
            </>
        }
      </Container>
    )
}
