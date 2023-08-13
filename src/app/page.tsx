import { Inter } from 'next/font/google'
import { supabase } from './libs/supabaseClient'
import { PostgrestSingleResponse } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

type Todo = {
  id: number,
  title: string
}


const inter = Inter({ subsets: ['latin'] })

export default async function Home() {

  const todos: PostgrestSingleResponse<Todo[]> = await supabase.from('todos').select("*");

  const addPost = async (formData: FormData) => {
    "use server"
    const textdata = formData.get('text')
    console.log(textdata)
    //supabaseにデータを追加
    await supabase.from('todos').insert({ text: textdata })

    //ページをリロード
    revalidatePath('/')
  }

  //削除ボタンを押したときの処理
  const deletePost = async (formData: FormData) => {
    "use server"
    const id = formData.get('id')

    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);

      if (error) {
        throw error;
      }

      console.log('Data deleted successfully.');

      //ページをリロード
      revalidatePath('/')

    } catch (error) {
      console.error('Error deleting data:', error);
    }
  }

  if (!todos) {
    return (
      <main className='py-4 mx-auto max-w-screen-md'>
        <article>
          <h1 className='text-3xl font-bold'>Next.js Server Actionsを試している</h1>

          <form action={addPost} className='my-8'>
            <input type='text' name='text' className='border border-gray-300 p-2' /><br />
            <button className='bg-blue-500 text-white p-1 rounded mt-2'>送信</button>
          </form>
        </article>

        <div className='border-t-5 pt-4'>
          <h2 className='text-2xl font-bold'>Todo一覧</h2>
          <p>投稿がありません。</p>
        </div>
      </main>
    )
  }

  return (
    <main className='py-4 mx-auto max-w-screen-md'>
      <article>
        <h1 className='text-3xl font-bold'>Next.js Server Actionsを試している</h1>

        <form action={addPost} className='my-8'>
          <input type='text' name='text' className='border border-gray-300 p-2' /><br />
          <button className='bg-blue-500 text-white p-1 rounded mt-2'>送信</button>
        </form>
      </article>

      <div className='border-t-5 pt-4'>
        <h2 className='text-2xl font-bold'>Todo一覧</h2>

        <ul>
          {todos.data?.map((todo: any) => (
            <li key={todo.id} className='border-t border-gray-300 p-3 flex justify-between'>
              <span>{todo.text}</span>

              <form>
                <input type='hidden' name='id' value={todo.id} />
                <button formAction={deletePost} className='cursor-pointer hover:text-red-500'>削除</button>
              </form>
            </li>
          )
          )}
        </ul>
      </div>
    </main>
  )
}
