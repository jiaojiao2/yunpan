(function () {
    //自己
    function findself(id) {
        return treeData.filter((item) => (item.id === (+id)))[0];
    }

    //子集
    function findChild(id) {
        return treeData.filter((item) => (item.pid === id));
    }

    //父级
    // function findParent(id) {
    //     return treeData.filter((item)=>())
    // }

    //找到所有父级ID
    function findParents(id) {
        let self = findself(id);
        let parents = [];
        let parent = treeData.filter((item) => (item.id === self.pid))[0];

        if (parent) {
            parents.push(parent);
            parents = parents.concat(findParents(parent.id))
        }
        return parents;
    }

    // console.log(findChild(0), findParents(2), findself(0));

    //试图渲染
    //菜单渲染
    let treeMenu = document.querySelector(".tree-menu");
    let root = -1;
    let level = 0;
    treeMenu.innerHTML = creatMenu(root, level);

    //生成树列表内容
    function creatMenu(id, level) {
        level++;
        // let parts=findParents(nowId);
        // parts.push(findself(nowId));
        let inner = "<ul>";
        findChild(id).forEach(item => {
            let child = findChild(item.id);
            /*class="${parts.includes(item) ? "open" : ""}"*/
            inner += `<li >
                            <p class="${child.length > 0 ? "has-child" : ""}" data-id="${item.id}" style="padding-left: ${level * 20}px">
                                <span><i></i>${item.title}</span>
                            </p>
                            ${child.length > 0 ? creatMenu(item.id, level + 1) : ""}
                        </li>`;
        });
        inner += "</ul>";
        return inner;
    }


    //导航渲染
    let showNowId = findChild(root)[0].id;

    function creatNav(id) {
        let breadNav = document.querySelector('.bread-nav');
        let self = findself(id);
        let parents = findParents(id).reverse();
        // console.log(parents, self)
        let inner = "";
        parents.forEach(item => {
            inner += `<a href="javascript:;" data-id="${item.id}">${item.title}</a>`
        });
        inner += `<span>${self.title}</span>`;
        breadNav.innerHTML = inner;
    }

    creatNav(showNowId);

    //文件夹渲染
    function createlist(id) {
        let folders = document.querySelector("#folders");
        let child = findChild(id);
        let childInner = "";
        child.forEach(item => {
            childInner += `<li class="folder-item  " data-id="${item.id}">
                    <img src="img/folder-b.png" alt="">
                    <span class="folder-name">${item.title}</span>
                    <input type="text" class="editor" value="${item.title}">
                    <label class="checked">
                        <input type="checkbox" />
                        <span class="iconfont icon-checkbox-checked"></span>
                    </label>   
                </li>`;
        });
        folders.innerHTML = childInner;
    }

    createlist(showNowId);


    //点击树形列表的切换
    let hasChildP = document.querySelectorAll(".has-child");
    hasChildP.forEach(item => {
        item.addEventListener("click", function () {
            document.querySelectorAll(".active").forEach(j=>{
                j.classList.remove("active")
            });
            item.parentElement.classList.toggle("open");
            let nowId = Number(item.getAttribute("data-id"));
            //重新渲染数据
            creatNav(nowId);
            createlist(nowId)
        })
    });

    //点击导航的切换
    let nav=document.querySelector(".bread-nav");
    nav.addEventListener("click",function (e) {
        if(e.target.tagName.toLowerCase()==="a"){
            let nowID=Number(e.target.getAttribute("data-id"));
            //重新渲染数据
            creatMenu(nowID, level);
            creatNav(nowID);
            createlist(nowID);
            let treeList=Array.from(document.querySelectorAll(".has-child"));
            // console.log(treeList);
            treeList.filter(item=>{
                let treeListId=item.getAttribute("data-id");
                if(treeListId==nowID){
                    let childs=Array.from(item.nextElementSibling.querySelectorAll(".has-child"));
                    childs.forEach(i=>{
                        i.parentElement.classList.remove("open")
                    })
                }
            })
        }
    });

    //点击列表切换
    let folderItem=document.querySelectorAll(".folder-item");
    folderItem.forEach(item=>{
        item.addEventListener("click",function (e) {
            let nowId=Number(item.getAttribute("data-id"));
            if(e.target.tagName.toLowerCase()==="img"){
                //重新渲染页面
                creatMenu(nowId, level);
                creatNav(nowId);
                createlist(nowId)
            }
        })
    })
})();


