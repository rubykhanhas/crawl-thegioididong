type CommentSchema = {
    username: string,
    post: string
}

type ItemSchema = {
    category: string,
    title: string,
    images: string[]
    price: number,
    sales: number,
    salePrice: number
    sold: number,
    remain: number,
    shortDes: string,
    longDes: string,
}
export {ItemSchema}