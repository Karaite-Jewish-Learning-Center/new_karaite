
https://moz.com/blog/using-term-frequency-analysis-to-measure-content-quality

https://moz.com/blog/inverse-document-frequency-and-the-importance-of-uniqueness

https://nlp.stanford.edu/IR-book/html/htmledition/inverse-document-frequency-1.html

collection frequency
cf = total number of occurrences of a term in the collection

document frequency
df = total number of documents that contain the term

N = total number of documents in the collection 

idf = log(N/df)

Example :
  N = 806.761
  

  Term  df      idf
  car   18.165  1.65
  auto   6.732  2.08
  

What is TF*IDF ?

For a term t in document d, the weight Wt,d of term t in document d is given by:

Wt,d = TFt,d log (N/DFt)

Where:

TFt,d is the number of occurrences of t in document d.
DFt is the number of documents containing the term t.
N is the total number of documents in the corpus.


In our  InvertedIndex model not exactly what above equation, but should work:

  N = InvertedIndex.objects.aggregate(total=Sum(len('documents')))['total']

  rank = sum(*count_by_document) * log(10,  N/ len(documents) )