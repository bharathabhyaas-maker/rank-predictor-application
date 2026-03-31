import ResultsPage from "@/components/result/ExamResult";


export default async function ResultLive({ params }: { params: { examid: string } }){
    const {examid}=await params
  return <ResultsPage  examId={examid}  />
}